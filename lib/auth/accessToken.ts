import { isFaking, isLocal } from '@/lib/env.ts'
import { getToken, validateToken } from '@navikt/oasis'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { logger } from '@navikt/next-logger'

export const checkToken = async () => {
    if (isLocal || isFaking) return

    const token = getToken(await headers())
    if (!token) {
        redirect('/oauth2/login')
    }

    const result = await validateToken(token)
    if (!result.ok) {
        logger.warn(`Tokenvalidering gikk galt: ${result.error.message}`)
        redirect('/oauth2/login')
    }
}