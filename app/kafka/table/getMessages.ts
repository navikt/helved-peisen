import { Message } from '@/app/kafka/types.ts'
import { ApiResponse, PaginatedResponse } from '@/lib/api/types.ts'
import { Routes } from '@/lib/api/routes.ts'

export async function getMessages(params: Record<string, string>): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const searchParams = new URLSearchParams(params)
    const response = await fetch(`${Routes.internal.messages}?${searchParams.toString()}`)

    if (!response.ok) {
        return {
            data: null,
            error: 'Klarte ikke hente meldinger',
        }
    }

    return await response.json()
}
