import type { Message } from '@/app/kafka/types.ts'
import { statusForMessage } from '@/lib/message.ts'

export const inferringStatus = (
    response: ApiResponse<Record<string, Message[]>>
): ApiResponse<Record<string, Message[]>> => {
    if (response.error) return response

    const data = Object.entries(response.data).map(([topic, messages]) => [
        topic,
        messages.map((it) => ({ ...it, status: statusForMessage(it) })),
    ])
    return {
        ...response,
        data: Object.fromEntries(data),
    }
}
