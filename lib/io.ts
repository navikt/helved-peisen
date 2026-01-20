import type { Message } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'

export async function fetchMessageValue(message: Message): Promise<string | undefined | null> {
    const res = await fetch(Routes.internal.message(message.topic_name, message.partition, message.offset))

    if (!res.ok) {
        throw Error(`Klarte ikke hente verdi for melding: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data.value
}

export async function resendMessage(message: Message) {
    const res = await fetch(Routes.internal.message(message.topic_name, message.partition, message.offset), {
        method: 'POST',
    })

    if (!res.ok) {
        throw Error(`Klarte ikke resende melding: ${res.statusText}`)
    }
}

export async function fetchHendelserForSak(sakId: string, fagsystem: string): Promise<Message[]> {
    const res = await fetch(Routes.internal.sak(encodeURIComponent(sakId), fagsystem))

    if (!res.ok) {
        throw Error(`Klarte ikke hente sak: ${res.statusText}`)
    }

    const json = await res.json()
    return json.data
}
