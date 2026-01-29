import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'

export async function fetchMessages(searchParams: URLSearchParams): Promise<Message[]> {
    const signal = AbortSignal.timeout(20_000)
    const res = await fetch(`${Routes.internal.messages}?${searchParams.toString()}`, { signal })

    if (res.redirected) {
        window.location.reload()
        return []
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
        window.location.reload()
        return null
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente verdi for melding: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}

export async function resendMessage(message: Message) {
    const res = await fetch(Routes.internal.message(message.topic_name, message.partition, message.offset), {
        method: 'POST',
    })

    if (res.redirected) {
        window.location.reload()
        return
    }

    if (!res.ok) {
        throw Error(`Klarte ikke resende melding: ${res.statusText}`)
    }
}

export async function fetchHendelserForSak(sakId: string, fagsystem: string): Promise<Message[]> {
    const res = await fetch(Routes.internal.sak(encodeURIComponent(sakId), fagsystem))

    if (res.redirected) {
        window.location.reload()
        return []
    }

    if (!res.ok) {
        throw Error(`Klarte ikke hente sak: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}
