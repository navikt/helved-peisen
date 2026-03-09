'use server'

import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { unauthorized } from 'next/navigation'
import { ApiResponse, PaginatedResponse } from '@/lib/api/types'
import { sanitizeKey, toMessage } from '@/lib/server/message.ts'

export async function getMessages(params: Record<string, string>): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const searchParams = new URLSearchParams(params)

    const response = await fetch(`${Routes.messages}?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!response.ok) {
        return {
            data: null,
            error: `Klarte ikke hente meldinger, backend svarte med ${response.status} - ${response.statusText}`,
        }
    }

    const page = await response.json()

    return {
        data: {
            items: page.items.map(toMessage).map(sanitizeKey),
            total: page.total,
        },
        error: null,
    }
}

export async function fetchRawMessage(message: Message): Promise<ApiResponse<RawMessage>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const res = await fetch(`${Routes.messages}/${message.topic_name}/${message.partition}/${message.offset}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke hente melding: ${res.status} - ${res.statusText}`,
        }
    }

    return {
        data: await res.json(),
        error: null,
    }
}

export async function resendMessage(message: Message, reason: string): Promise<ApiResponse<null>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const formData = new FormData()
    formData.set('topic', encodeURIComponent(message.topic_name))
    formData.set('partition', `${message.partition}`)
    formData.set('offset', `${message.offset}`)
    formData.set('reason', reason)

    const res = await fetch(`${Routes.resend}`, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke resende melding: ${res.status} - ${res.statusText}`,
        }
    }

    return { data: null, error: null }
}
