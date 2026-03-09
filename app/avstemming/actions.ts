'use server'

import { subDays } from 'date-fns/subDays'
import { getApiTokenFromCookie, getVedskivaApiTokenFromCookie } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import { AvstemmingRequest, RawAvstemmingMessage } from '@/app/avstemming/types.ts'
import { ApiResponse } from '@/lib/api/types.ts'
import { unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'

export async function fetchAvstemminger(dager: number = 14): Promise<ApiResponse<string[]>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const tom = new Date().toISOString()
    const fom = subDays(new Date(), dager).toISOString()

    const url = `${Routes.avstemminger}?fom=${encodeURIComponent(fom)}&tom=${encodeURIComponent(tom)}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}`,
        }
    }

    const data: RawAvstemmingMessage[] = await res.json()

    return {
        data: data.map((message) => message.value),
        error: null,
    }
}

export async function fetchAvstemmingDryrun(range: AvstemmingRequest): Promise<ApiResponse<string>> {
    const apiToken = await getVedskivaApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.avstemmingDryrun, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(range),
    })

    if (!res.ok) {
        logger.error(`Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`)
        return {
            data: null,
            error: `Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`,
        }
    }

    const data = await res.json()
    return { data, error: null }
}

export async function fetchAvstemmingDryrunV2(range: AvstemmingRequest): Promise<ApiResponse<string>> {
    const apiToken = await getVedskivaApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.avstemmingDryrunv2, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(range),
    })

    if (!res.ok) {
        logger.error(`Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`)
        return {
            data: null,
            error: `Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`,
        }
    }

    const data = await res.json()
    return { data, error: null }
}
