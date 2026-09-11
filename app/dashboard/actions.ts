'use server'

import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { checkToken, getApiToken, requireAdmin } from '@/lib/server/auth.ts'
import type { ServerActionResponse } from '@/app/kafka/table/actionMenu/types.ts'
import type { KorrigertFeiletUtbetaling } from './types'

export async function håndterDobbeltutbetaling(
    behandlingId: string,
    klassekode: string,
    fom: string,
    tom: string
): Promise<ServerActionResponse<void>> {
    await checkToken()
    await requireAdmin()
    const params = new URLSearchParams({ behandlingId, klassekode, fom, tom })
    const response = await fetch(`${Routes.dobbeltutbetalinger}?${params}`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${await getApiToken()}`,
        },
    })

    if (!response.ok) {
        logger.error(`Server responded with status: ${response.status} - ${response.statusText}`)
        return {
            status: 'error',
            message: `Klarte ikke håndtere dobbeltutbetaling. Mottok status ${response.status}`,
        }
    }

    return { status: 'success' }
}

export const korrigerFeiletUtbetalingAction = async (
    korrigeringer: Omit<KorrigertFeiletUtbetaling, 'reason'>[],
    _initialState: ServerActionResponse<void>,
    formData: FormData
): Promise<ServerActionResponse<void>> => {
    await checkToken()
    await requireAdmin()

    const reasonValue = formData.get('reason')
    const reason = typeof reasonValue === 'string' ? reasonValue.trim() : ''

    if (!reason || reason.length === 0) {
        return {
            status: 'invalid',
            validation: {
                reason: 'Grunn må oppgis',
            },
        }
    }

    formData.set('reason', reason)
    formData.set('korrigeringer', JSON.stringify(korrigeringer))

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
