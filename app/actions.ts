'use server'

import { cookies } from 'next/headers'
import { fetchApiToken } from '@/lib/auth/apiToken'
import { Routes } from '@/lib/api/routes'
import { logger } from '@navikt/next-logger'
import { checkToken } from '@/lib/auth/accessToken.ts'

export async function deleteApiToken() {
    ;(await cookies()).delete('api-token')
}

export async function addKvittering(
    formData: FormData
): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.manuellKvittering, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await fetchApiToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
        logger.error(
            `Server responded with status: ${response.status} - ${response.statusText}`
        )
        return {
            data: null,
            error: {
                message: `Server responded with status: ${response.status} - ${response.statusText}`,
                statusCode: response.status,
            },
        }
    }

    return {
        data: null,
        error: null,
    }
}

export async function addOppdrag(
    formData: FormData
): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.manuellOppdrag, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await fetchApiToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
        logger.error(
            `Server responded with status: ${response.status} - ${response.statusText}`
        )
        return {
            data: null,
            error: {
                message: `Server responded with status: ${response.status} - ${response.statusText}`,
                statusCode: response.status,
            },
        }
    }

    return {
        data: null,
        error: null,
    }
}

export async function movePendingToUtbetaling(
    formData: FormData
): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.flyttTilUtbetalinger, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await fetchApiToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
        logger.error(
            `Server responded with status: ${response.status} - ${response.statusText}`
        )
        return {
            data: null,
            error: {
                message: `Server responded with status: ${response.status} - ${response.statusText}`,
                statusCode: response.status,
            },
        }
    }

    return {
        data: null,
        error: null,
    }
}
