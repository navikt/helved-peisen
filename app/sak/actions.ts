'use server'

import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { unauthorized } from 'next/navigation'
import { sanitizeKey, toMessage } from '@/lib/server/message.ts'
import { ApiResponse } from '@/lib/api/types.ts'

export async function fetchHendelserForSak(sakId: string, fagsystem: string): Promise<ApiResponse<Message[]>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.external.sak(encodeURIComponent(sakId), fagsystem), {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke hente hendelser for sak: ${res.status} - ${res.statusText}`,
        }
    }

    const data = await res.json()

    return {
        data: data.map((it: RawMessage) => sanitizeKey(toMessage(it))),
        error: null,
    }
}
