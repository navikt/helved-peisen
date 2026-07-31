'use server'

import { subDays } from 'date-fns'
import { logger } from '@navikt/next-logger'

import type { RawMessage } from '@/app/kafka/types.ts'
import { Topics } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { getApiToken } from '@/lib/server/auth.ts'
import { xmlToJson } from '@/lib/server/xml.ts'
import { isDataMelding, type AvstemmingMelding, type DataMelding } from '@/app/avstemming/types.ts'
import {
    computeAvstemmingStatus,
    findDobbeltutbetalinger,
    findManglendeKvittering,
} from '@/lib/server/dashboard.ts'
import type {
    AvstemmingStatus,
    DashboardSection,
    DashboardSummary,
    DobbeltutbetalingCandidate,
    FeiletSummary,
    ManglendeKvittering,
    PendingMismatchSummary,
} from '@/app/dashboard/types.ts'
import { unauthorized } from 'next/navigation'

const DEFAULT_WINDOW_DAYS = 3
const AVSTEMMING_LOOKBACK_DAYS = 14
const KVITTERING_THRESHOLD_MS = 60 * 60 * 1000 // 1 time

async function fetchRawMessagesPage(
    params: Record<string, string>,
    apiToken: string
): Promise<{ items: RawMessage[]; total: number }> {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${Routes.messages}?${query}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
    })

    if (!res.ok) {
        throw new Error(`Klarte ikke hente meldinger (${params.topics ?? 'alle topics'}): ${res.status} - ${res.statusText}`)
    }

    return res.json()
}

async function fetchRawMessages(
    topic: string,
    fom: string,
    tom: string,
    apiToken: string
): Promise<RawMessage[]> {
    const query = new URLSearchParams({ fom, tom }).toString()
    const res = await fetch(`${Routes.messages}/${encodeURIComponent(topic)}?${query}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
    })

    if (!res.ok) {
        throw new Error(`Klarte ikke hente meldinger (${topic}): ${res.status} - ${res.statusText}`)
    }

    return res.json()
}

async function fetchAvstemminger(
    fom: string,
    tom: string,
    apiToken: string
): Promise<{ fagsystem: string; avstemming: DataMelding }[]> {
    const query = new URLSearchParams({ fom, tom }).toString()
    const res = await fetch(`${Routes.avstemminger}?${query}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
    })

    if (!res.ok) {
        throw new Error(`Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}`)
    }

    const data: { value: string }[] = await res.json()

    return data
        .map((it) => xmlToJson(it.value) as AvstemmingMelding)
        .filter(isDataMelding)
        .map((avstemming) => ({ fagsystem: avstemming.aksjon.avleverendeKomponentKode, avstemming }))
}

async function fetchFeiletSummary(fom: string, tom: string, apiToken: string): Promise<FeiletSummary> {
    const { total } = await fetchRawMessagesPage({ status: 'FEILET', fom, tom, page: '1', pageSize: '1' }, apiToken)
    return { count: total }
}

type PendingMismatch = {
    uid: string
    sakId: string | null
    fagsystem: string | null
}

async function fetchPendingMismatches(since: number, apiToken: string): Promise<PendingMismatch[]> {
    const query = new URLSearchParams({ since: String(since) }).toString()
    const res = await fetch(`${Routes.pendingMismatch}?${query}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
        cache: 'no-store',
    })

    if (!res.ok) {
        throw new Error(`Klarte ikke hente pending mismatch: ${res.status} - ${res.statusText}`)
    }

    return res.json()
}

async function fetchPendingMismatchSummary(fom: string, apiToken: string): Promise<PendingMismatchSummary> {
    const mismatches = await fetchPendingMismatches(new Date(fom).getTime(), apiToken)

    return {
        count: mismatches.length,
        sampleKeys: [...new Set(mismatches.map((m) => m.uid))].slice(0, 10),
    }
}

async function fetchAvstemmingStatusSummary(apiToken: string): Promise<AvstemmingStatus[]> {
    const now = new Date()
    const yesterday = subDays(now, 1)
    const lookbackFom = subDays(now, AVSTEMMING_LOOKBACK_DAYS).toISOString()

    const datameldinger = await fetchAvstemminger(lookbackFom, now.toISOString(), apiToken)
    const expectedFagsystemer = [...new Set(datameldinger.map((it) => it.fagsystem))].sort()

    return computeAvstemmingStatus(datameldinger, expectedFagsystemer, yesterday)
}

async function fetchManglendeKvitteringSummary(
    fom: string,
    tom: string,
    apiToken: string
): Promise<ManglendeKvittering[]> {
    const [oppdragMessages, statusMessages] = await Promise.all([
        fetchRawMessages(Topics.oppdrag, fom, tom, apiToken),
        fetchRawMessages(Topics.status, fom, tom, apiToken),
    ])

    return findManglendeKvittering(oppdragMessages, statusMessages, Date.now(), KVITTERING_THRESHOLD_MS)
}

async function fetchDobbeltutbetalingSummary(
    fom: string,
    tom: string,
    apiToken: string
): Promise<DobbeltutbetalingCandidate[]> {
    const messages = await fetchRawMessages(Topics.status, fom, tom, apiToken)
    const statusMessages = messages.filter((m) => m.status === 'OK')
    return findDobbeltutbetalinger(statusMessages)
}

async function section<T>(fn: () => Promise<T>): Promise<DashboardSection<T>> {
    try {
        return { data: await fn(), error: null }
    } catch (err) {
        logger.error(err instanceof Error ? err : new Error(String(err)))
        return { data: null, error: err instanceof Error ? err.message : 'Ukjent feil' }
    }
}

export async function getDashboardSummary(customFom?: string, customTom?: string): Promise<DashboardSummary> {
    const now = new Date()
    const fom = customFom ?? subDays(now, DEFAULT_WINDOW_DAYS).toISOString()
    const tom = customTom ?? now.toISOString()

    const apiToken = await getApiToken()
    if (!apiToken) return unauthorized()

    const [feilet, pendingMismatch, avstemming] = await Promise.all([
        section(() => fetchFeiletSummary(fom, tom, apiToken)),
        section(() => fetchPendingMismatchSummary(fom, apiToken)),
        section(() => fetchAvstemmingStatusSummary(apiToken)),
    ])

    return { fom, tom, feilet, pendingMismatch, avstemming }
}

export async function getManglendeKvitteringSummary(
    fom: string,
    tom: string
): Promise<DashboardSection<ManglendeKvittering[]>> {
    const apiToken = await getApiToken()
    if (!apiToken) return unauthorized()

    return section(() => fetchManglendeKvitteringSummary(fom, tom, apiToken))
}

export async function getDobbeltutbetalingSummary(
    fom: string,
    tom: string
): Promise<DashboardSection<DobbeltutbetalingCandidate[]>> {
    const apiToken = await getApiToken()
    if (!apiToken) return unauthorized()

    return section(() => fetchDobbeltutbetalingSummary(fom, tom, apiToken))
}
