import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { AvstemmingRequest, RawAvstemmingMessage } from '@/app/avstemming/types.ts'
import { PaginatedResponse } from './api/types'
import { subDays } from 'date-fns'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { logger } from '@navikt/next-logger'

export async function fetchMessages(searchParams: URLSearchParams): Promise<PaginatedResponse<Message>> {
    const signal = AbortSignal.timeout(20_000)
    const res = await fetch(`${Routes.internal.messages}?${searchParams.toString()}`, { signal })

    if (res.redirected) {
        window.location.reload()
        return { items: [], total: 0 }
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente meldinger: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function fetchRawMessage(message: Message): Promise<RawMessage | undefined | null> {
    const res = await fetch(Routes.internal.message(message.topic_name, message.partition, message.offset))

    if (res.redirected) {
        return null
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente verdi for melding: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function resendMessage(message: Message, reason: string) {
    const res = await fetch(Routes.internal.message(message.topic_name, message.partition, message.offset), {
        method: 'POST',
        body: JSON.stringify(reason),
    })

    if (res.redirected) {
        window.location.reload()
    }

    if (!res.ok) {
        throw Error(`Klarte ikke resende melding: ${res.statusText}`)
    }
}

export async function fetchHendelserForSak(sakId: string, fagsystem: string): Promise<Message[]> {
    const res = await fetch(Routes.internal.sak(encodeURIComponent(sakId), fagsystem))

    if (res.redirected) {
        window.location.reload()
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente sak: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function fetchAvstemmingNextRange(today: string): Promise<AvstemmingRequest> {
    const res = await fetch('/api/avstemming/next-range', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ today }),
    })

    if (res.redirected) {
        window.location.reload()
        return { today: '', fom: '', tom: '' }
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente neste range: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function fetchAvstemmingDryrun(range: AvstemmingRequest): Promise<string> {
    const res = await fetch('/api/avstemming/dryrun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(range),
    })

    if (res.redirected) {
        window.location.reload()
        return ''
    }

    if (!res.ok) {
        throw Error(`Klarte ikke kjøre dryrun: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function fetchAvstemminger(dager: number = 14): Promise<string[]> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return []

    const tom = new Date().toISOString()
    const fom = subDays(new Date(), dager).toISOString()

    const url = `${Routes.external.avstemminger}?fom=${encodeURIComponent(fom)}&tom=${encodeURIComponent(tom)}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        logger.error(`Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}`)
        return []
    }

    const data: RawAvstemmingMessage[] = await res.json()

    return data.map((message) => message.value)
}
