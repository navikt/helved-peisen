'use server'

import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { checkToken, getApiToken } from '@/lib/server/auth.ts'
import type { ServerActionResponse } from '@/app/kafka/table/actionMenu/types.ts'

export async function håndterDobbeltutbetaling(
    behandlingId: string,
    klassekode: string,
    fom: string,
    tom: string
): Promise<ServerActionResponse<void>> {
    await checkToken()
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
            message: `Klarte ikke håndtere dobbeltutbetaling. Server svarte med ${response.status}`,
        }
    }

    return { status: 'success' }
}
