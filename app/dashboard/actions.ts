'use server'

import { ServerActionResponse } from '../kafka/table/actionMenu/types'
import { KorrigertFeiletUtbetaling } from './types'
import { checkToken, getApiToken } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'

export const korrigerFeiletUtbetalingAction = async (
    korrigering: Omit<KorrigertFeiletUtbetaling, 'reason'>,
    _initialState: any,
    formData: FormData
): Promise<ServerActionResponse<void>> => {
    await checkToken()

    const reason = `${formData.get('reason')}`

    if (!reason || reason.length === 0) {
        return {
            status: 'invalid',
            validation: {
                reason: 'Grunn må oppgis',
            },
        }
    }

    formData.set('topic', korrigering.topic)
    formData.set('key', korrigering.key)

    const response = await fetch(Routes.korrigerFeiletUtbetaling, {
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
            message: `Klarte ikke markere feilet utbetaling som korrigert. Mottok status ${response.status} fra server.`,
        }
    }

    return { status: 'success' }
}
