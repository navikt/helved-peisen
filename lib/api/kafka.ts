'use server'

import { logger } from '@navikt/next-logger'

import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/auth/apiToken.ts'
import { Message } from '@/app/kafka/types.ts'

export const fetchMessages = async (
    searchParams: URLSearchParams
): Promise<ApiResponse<Message[]>> => {
    const apiToken = await getApiTokenFromCookie()
    const signal = AbortSignal.timeout(20_000)

    return fetch(`${Routes.external.kafka}?${searchParams.toString()}`, {
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
        signal,
    })
        .then(async (response) => {
            if (response.ok) {
                return {
                    data: await response.json(),
                    error: null,
                }
            } else {
                throw response
            }
        })
        .catch((error) => {
            if (error.name === 'TimeoutError') {
                logger.error('Timeout ved henting av Kafka data')
                return {
                    data: null,
                    error: {
                        message: 'Timeout ved henting av Kafka data',
                        statusCode: 504,
                    },
                }
            } else {
                logger.error(
                    `Klarte ikke hente Kafka data: ${error.status} - ${error.statusText}`
                )
                return {
                    data: null,
                    error: {
                        message: `Klarte ikke hente Kafka data: ${error.status} - ${error.statusText}`,
                        statusCode: error.status,
                    },
                }
            }
        })
}
