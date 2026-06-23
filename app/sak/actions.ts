'use server'

import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { getApiToken } from '@/lib/server/auth.ts'
import { unauthorized } from 'next/navigation'
import { toMessages } from '@/lib/server/message.ts'
import { ApiResponse } from '@/lib/api/types.ts'

export async function fetchHendelserForSak(sakId: string, fagsystem: string): Promise<ApiResponse<Message[]>> {
    const apiToken = await getApiToken()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.sak(encodeURIComponent(sakId), fagsystem), {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke hente hendelser for sak: ${res.status} - ${res.statusText}`,
        }
    }

    const data = (await res.json()) as RawMessage[]

    return {
        data: toMessages(data),
        error: null,
    }
}
