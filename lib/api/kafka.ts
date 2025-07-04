'use server'

import { logger } from '@navikt/next-logger'

import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/auth/apiToken.ts'
import { Message } from '@/app/kafka/types.ts'

export const fetchMessages = async (
    searchParams: URLSearchParams
): Promise<ApiResponse<Message[]>> => {
    const apiToken = await getApiTokenFromCookie()
    const response = await fetch(
        `${Routes.external.kafka}?${searchParams.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        }
    )

    if (response.ok) {
        return {
            data: await response.json(),
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
