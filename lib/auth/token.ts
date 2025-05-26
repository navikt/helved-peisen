'use server'

import {
    getToken,
    requestAzureClientCredentialsToken,
    validateToken,
} from '@navikt/oasis'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { isFaking, isLocal, requireEnv } from '@/lib/env'
import { logger } from '@navikt/next-logger'

const UTSJEKK_TOKEN_NAME = 'utsjekk-token'

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

export const checkApiToken = async () => {
    if (process.env.NEXT_PUBLIC_API_FAKING === 'enabled') {
        return
    }
    const cookieStore = await cookies()
    const existingApiToken = cookieStore.get(UTSJEKK_TOKEN_NAME)
    if (!existingApiToken) {
        redirect('/api/auth/token')
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

export const updateCookieToken = async (token: string) => {
    const cookieStore = await cookies()
    cookieStore.set({
        name: UTSJEKK_TOKEN_NAME,
        value: token,
        httpOnly: true,
    })
}

const getLocalToken = async (): Promise<string> => {
    const cookieStore = await cookies()
    const existing = cookieStore.get(UTSJEKK_TOKEN_NAME)
    if (existing) {
        return existing.value
    }

    const response = await fetch('http://localhost:8080/token')
    const body = await response.json()

    await updateCookieToken(body.access_token)
    return body.access_token
}

export const fetchApiToken = async (): Promise<string> => {
    if (isFaking) {
        return Promise.resolve('')
    }

    if (isLocal) {
        return getLocalToken()
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
