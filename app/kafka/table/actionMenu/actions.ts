'use server'

import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { checkToken, getApiTokenFromCookie, getUtsjekkApiTokenFromCookie } from '@/lib/server/auth.ts'
import type { Message } from '@/app/kafka/types.ts'
import type { ServerActionResponse } from '@/app/kafka/table/actionMenu/types.ts'

export async function addKvittering(
    message: Pick<Message, 'partition' | 'offset' | 'key'>,
    _initialState: any,
    formData: FormData
): Promise<ServerActionResponse<void>> {
    await checkToken()

    formData.set('partition', `${message.partition}`)
    formData.set('offset', `${message.offset}`)
    formData.set('key', message.key)

    const reason = formData.get('reason') as string | null
    if (!reason || reason.length === 0) {
        return {
            status: 'invalid',
            validation: {
                reason: 'Grunn må oppgis',
            },
        }
    }

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
            status: 'error',
            message: `Klarte ikke legge til kvittering. Mottok status ${response.status} fra server.`,
        }
    }

    return { status: 'success' }
}

export async function movePendingToUtbetaling(formData: FormData): Promise<ServerActionResponse<void>> {
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
            status: 'error',
            message: `Klarte ikke flytte utbetaling til pending. Server svarte med ${response.status}`,
        }
    }

    return { status: 'success' }
}

export async function tombstoneUtbetaling(
    key: string,
    _initialState: any,
    formData: FormData
): Promise<ServerActionResponse<void>> {
    await checkToken()

    formData.set('key', key)

    const reason = formData.get('reason') as string | null
    if (!reason || reason.length === 0) {
        return {
            status: 'invalid',
            validation: {
                reason: 'Grunn må oppgis',
            },
        }
    }

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
            status: 'error',
            message: `Klarte ikke tombstone utbetaling. Server svarte med ${response.status}`,
        }
    }

    return { status: 'success' }
}

export async function remigrerUtbetaling(data: any): Promise<ServerActionResponse<void>> {
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
        return { status: 'error', message: `Klarte ikke remigrere. Server svarte med ${response.status}` }
    }

    return { status: 'success' }
}

export async function remigrerUtbetalingDryrun(
    data: object,
    fagsystem: string = 'TILLEGGSSTØNADER'
): Promise<ServerActionResponse<ReturnType<typeof Response.json>>> {
    await checkToken()
    const response = await fetch(Routes.external.remigrerDryrun, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getUtsjekkApiTokenFromCookie()}`,
            'Content-Type': 'application/json',
            Fagsystem: fagsystem,
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            status: 'error',
            message: `Klarte ikke hente preview av remigrering. Server svarte med ${response.status}`,
        }
    }

    return {
        status: 'success',
        data: await response.json(),
    }
}
