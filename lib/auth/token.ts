'use server'

import {
    getToken,
    requestAzureClientCredentialsToken,
    validateToken,
} from '@navikt/oasis'
import { cookies, headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'
import { isFaking, isLocal, requireEnv } from '@/lib/env'
import { logger } from '@navikt/next-logger'

const UTSJEKK_TOKEN_NAME = 'utsjekk-token'

export const checkToken = async () => {
    if (isLocal || isFaking) return

    const token = getToken(await headers())
    if (!token || !(await validateToken(token)).ok) {
        redirect('/internal/login')
    }

    const result = await validateToken(token)
    if (!result.ok) {
        logger.warn(`Tokenvalidering gikk galt: ${result.error.message}`)
        unauthorized()
    }
}

const getTokenFromCookie = async () => {
    const cookieStore = await cookies()
    const existing = cookieStore.get(UTSJEKK_TOKEN_NAME)

    if (existing) {
        const validation = await validateToken(existing.value)
        if (validation.ok) {
            return existing.value
        }
    }

    return null
}

export const fetchApiToken = async (): Promise<string> => {
    if (isFaking || isLocal) {
        return Promise.resolve('')
    }

    const existing = await getTokenFromCookie()
    if (existing) {
        return existing
    }

    logger.info('Henter nytt token')

    const token = getToken(await headers())
    if (!token) {
        throw new Error('Mangler access token')
    }

    const scope = requireEnv('UTSJEKK_SCOPE')
    const result = await requestAzureClientCredentialsToken(scope)
    if (!result.ok) {
        logger.error(`Henting av api-token feilet: ${result.error.message}`)
        throw Error(`Henting av api-token feilet: ${result.error.message}`)
    }

    return result.token
}
