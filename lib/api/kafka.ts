'use server'

import { logger } from '@navikt/next-logger'

import { Routes } from '@/lib/api/routes.ts'
import { fetchApiToken } from '@/lib/auth/apiToken.ts'
import { Message } from '@/app/kafka/types.ts'

export const fetchMessages = async (
    searchParams: URLSearchParams
): Promise<ApiResponse<Message[]>> => {
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
        const json = await response.json()
        console.log(json)
        return {
            data: json,
            error: null,
        }
    } else {
        logger.error(
            `Klarte ikke hente Kafka data: ${response.status} - ${response.statusText}`
        )
        return {
            data: null,
            error: {
                message: `Klarte ikke hente Kafka data: ${response.status} - ${response.statusText}`,
                statusCode: response.status,
            },
        }
    }
}
