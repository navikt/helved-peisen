'use server'

import { Message } from '@/app/kafka/types.ts'
import { ApiResponse, PaginatedResponse } from '@/lib/api/types.ts'
import { checkToken, getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { sanitizeKey, toMessage } from '@/lib/server/message'
import { Routes } from '@/lib/api/routes.ts'

export async function getMessages(params: Record<string, string>): Promise<ApiResponse<PaginatedResponse<Message>>> {
    await checkToken()
    const searchParams = new URLSearchParams(params)

    try {
        const response = await fetch(`${Routes.external.kafka}/messages?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${await getApiTokenFromCookie()}` },
        })

        if (!response.ok) {
            return { data: null, error: `Klarte ikke hente meldinger: ${response.status} - ${response.statusText}` }
        }

        const page = await response.json()

        return {
            data: {
                items: page.items.map(toMessage).map(sanitizeKey),
                total: page.total,
            },
            error: null,
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            return { data: null, error: e.message }
        }

        return { data: null, error: `Klarte ikke hente meldinger: ${e}` }
    }
}
