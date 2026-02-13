'use server'

import { ApiResponse } from '@/lib/api/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { checkToken, getApiTokenFromCookie, getUtsjekkApiTokenFromCookie } from '@/lib/server/auth.ts'

export async function addKvittering(formData: FormData): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.manuellKvittering, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiTokenFromCookie()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            data: null,
            error: `Server responded with status: ${response.status} - ${response.statusText}`,
        }
    }

    return {
        data: null,
        error: null,
    }
}

export async function movePendingToUtbetaling(formData: FormData): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.pendingTilUtbetaling, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiTokenFromCookie()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            data: null,
            error: `Server responded with status: ${response.status} - ${response.statusText}`,
        }
    }

    return {
        data: null,
        error: null,
    }
}

export async function tombstoneUtbetaling(formData: FormData): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.tombstoneUtbetaling, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiTokenFromCookie()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            data: null,
            error: `Server responded with status: ${response.status} - ${response.statusText}`,
        }
    }

    return {
        data: null,
        error: null,
    }
}

export async function remigrerUtbetaling(data: object): Promise<ApiResponse<null>> {
    await checkToken()
    const response = await fetch(Routes.external.remigrer, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getUtsjekkApiTokenFromCookie()}`,
            'Content-Type': 'application/json',
            Fagsystem: 'TILLEGGSSTØNADER',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            data: null,
            error: `Server responded with status: ${response.status} - ${response.statusText}`,
        }
    }

    return {
        data: null,
        error: null,
    }
}

export async function remigrerUtbetalingDryrun(data: object): Promise<ApiResponse<any>> {
    await checkToken()
    const response = await fetch(Routes.external.remigrerDryrun, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getUtsjekkApiTokenFromCookie()}`,
            'Content-Type': 'application/json',
            Fagsystem: 'TILLEGGSSTØNADER',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            data: null,
            error: `Server responded with status: ${response.status} - ${response.statusText}`,
        }
    }

    return {
        data: await response.json(),
        error: null,
    }
}
