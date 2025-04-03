import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { fetchApiToken } from '@/lib/auth/token.ts'
import { Message } from '@/app/kafka/types.ts'

export const fetchMessages = async (
    searchParams: URLSearchParams
): Promise<Message[]> => {
    const apiToken = await fetchApiToken()
    const response = await fetch(
        `${Routes.external.kafka}?${searchParams.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        }
    )

    if (response.ok) {
        return response.json()
    } else {
        logger.error(
            `Klarte ikke hente Kafka data: ${response.status} - ${response.statusText}`
        )
        return []
    }
}
