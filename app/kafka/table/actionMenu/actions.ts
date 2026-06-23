'use server'

import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { checkToken, getApiToken, getUtsjekkApiToken } from '@/lib/server/auth.ts'
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

    const response = await fetch(Routes.manuellKvittering, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiToken()}`,
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
    const response = await fetch(Routes.pendingTilUtbetaling, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiToken()}`,
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

    const response = await fetch(Routes.tombstoneUtbetaling, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiToken()}`,
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

export async function sendOkStatus(
    key: string,
    fagsystem: string | null | undefined,
    _initialState: any,
    formData: FormData
): Promise<ServerActionResponse<void>> {
    await checkToken()

    const reason = formData.get('reason') as string | null
    if (!reason || reason.length === 0) {
        return {
            status: 'invalid',
            validation: {
                reason: 'Grunn må oppgis',
            },
        }
    }

    const response = await fetch(Routes.okStatus, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, fagsystem, reason }),
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            status: 'error',
            message: `Klarte ikke sende OK status. Server svarte med ${response.status}`,
        }
    }

    return { status: 'success' }
}

export async function remigrerUtbetaling(data: any): Promise<ServerActionResponse<void>> {
    await checkToken()
    const response = await fetch(Routes.remigrer, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getUtsjekkApiToken()}`,
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
    const response = await fetch(Routes.remigrerDryrun, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getUtsjekkApiToken()}`,
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
