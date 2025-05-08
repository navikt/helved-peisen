import { Routes } from '@/lib/api/routes.ts'
import { fetchApiToken } from '@/lib/auth/token.ts'
import { logger } from '@navikt/next-logger'

interface KvitteringRequest {
    oppdragXml: string
    messageKey: string
    alvorlighetsgrad: string
    beskrMelding?: string
    kodeMelding?: string
}

export const addManuellKvittering = async (
    oppdragXml: string,
    messageKey: string,
    alvorlighetsgrad: string,
    beskrMelding?: string,
    kodeMelding?: string
): Promise<any> => {
    const kvitteringRequest: KvitteringRequest = {
        oppdragXml,
        messageKey,
        alvorlighetsgrad,
        beskrMelding,
        kodeMelding,
    }
    try {
        const apiToken = await fetchApiToken()

        const response = await fetch(Routes.internal.manuellKvittering, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(kvitteringRequest),
        })

        if (!response.ok) {
            logger.error(
                `Server responded with status: ${response.status} - ${response.statusText}`
            )
            return {
                success: false,
                message: `Server responded with status: ${response.status} - ${response.statusText}`,
            }
        }

        return { success: true, message: 'Kvittering ble lagt til' }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Uventet feil'
        return { success: false, message }
    }
}
