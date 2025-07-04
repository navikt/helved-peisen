'use server'

import {
    expiresIn,
    getToken,
    requestAzureClientCredentialsToken,
} from '@navikt/oasis'
import { cookies, headers } from 'next/headers'
import { isFaking, isLocal, requireEnv } from '@/lib/env'
import { logger } from '@navikt/next-logger'
import { redirect, unauthorized } from 'next/navigation'

const API_TOKEN_NAME = 'api-token'

export const ensureValidApiToken = async () => {
    if (isFaking) {
        return
    }
    const existing = await getApiTokenFromCookie()
    if (!existing) {
        return isLocal ? unauthorized() : redirect('/internal/login')
    }
}

export const getApiTokenFromCookie = async () => {
    const cookieStore = await cookies()
    const existing = cookieStore.get(API_TOKEN_NAME)

    try {
        if (existing && expiresIn(existing.value) > 0) {
            return existing.value
        }
    } catch {}
    return null
}

export async function fetchApiToken(): Promise<string> {
    if (isFaking) {
        return Promise.resolve('')
    }

    if (isLocal) {
        const token = process.env.API_TOKEN
        if (!token) {
            unauthorized()
        }
        return token
    }

    const existing = await getApiTokenFromCookie()
    if (existing) {
        return existing
    }

    logger.info('Henter nytt token')

    const token = getToken(await headers())
    if (!token) {
        redirect("/internal/login")
    }

    const scope = requireEnv('API_SCOPE')
    const result = await requestAzureClientCredentialsToken(scope)
    if (!result.ok) {
        logger.error(`Henting av api-token feilet: ${result.error.message}`)
        throw Error(`Henting av api-token feilet: ${result.error.message}`)
    }

    return result.token
}
