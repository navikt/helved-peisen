import { Routes } from '@/lib/api/routes.ts'
import { Message } from '@/app/kafka/types.ts'

export const fetchMessages = async (searchParams: URLSearchParams): Promise<ApiResponse<Message[]>> => {
    const signal = AbortSignal.timeout(20_000)

    return fetch(`${Routes.internal.messages}?${searchParams.toString()}`, { method: 'GET', signal })
        .then(async (response) => {
            if (response.ok) {
                return await response.json()
            } else {
                throw response
            }
        })
        .catch((error) => {
            return {
                data: null,
                error: {
                    message: `Klarte ikke hente Kafka data: ${error.status} - ${error.statusText}`,
                    statusCode: error.status,
                },
            }
        })
}
