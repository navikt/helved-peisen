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

const PEISSCHTAPPERN_TOKEN_NAME = 'peisschtappern-token'

const updateApiToken = async (token: string) => {
    (await cookies()).set({
        name: PEISSCHTAPPERN_TOKEN_NAME,
        value: token,
        httpOnly: true,
    })
}

export const checkApiToken = async () => {
    if (isFaking) {
        return
    }
    if (!getApiTokenFromCookie()) {
        const apiToken: string = await fetchApiToken()
        updateApiToken(apiToken)
    }
}

const getApiTokenFromCookie = async () => {
    const cookieStore = await cookies()
    const existing = cookieStore.get(PEISSCHTAPPERN_TOKEN_NAME)

    if (existing) {
        const validation = await validateToken(existing.value)
        if (validation.ok) {
            return existing.value
        }
    }

    return null
}

const getLocalToken = async (): Promise<string> => {
    const existing = process.env.PEISSCHTAPPERN_TOKEN ?? await getApiTokenFromCookie()
    if (existing) {
        return existing
    }

    const response = await fetch('http://localhost:8080/token')
    const body = await response.json()

    await updateApiToken(body.access_token)
    return body.access_token
}

export async function fetchApiToken(): Promise<string> {
    if (isFaking) {
        return Promise.resolve('')
    }

    if (isLocal) {
        return getLocalToken()
    }

    const existing = await getApiTokenFromCookie()
    if (existing) {
        return existing
    }

    logger.info('Henter nytt token')

    const token = getToken(await headers())
    if (!token) {
        throw new Error('Mangler access token')
    }

    const scope = requireEnv('PEISSCHTAPPERN_SCOPE')
    const result = await requestAzureClientCredentialsToken(scope)
    if (!result.ok) {
        logger.error(`Henting av api-token feilet: ${result.error.message}`)
        throw Error(`Henting av api-token feilet: ${result.error.message}`)
    }

    await updateApiToken(result.token)

    return result.token
}
