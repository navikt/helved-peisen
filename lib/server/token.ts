import { NextResponse } from 'next/server'
import { requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'
import { requireEnv } from '@/lib/env.ts'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

async function fetchToken(scope: string) {
    const result = await requestAzureClientCredentialsToken(scope)
    if (!result.ok) {
        logger.error(`Henting av token feilet: ${result.error.message}`)
        throw Error(`Henting av token feilet: ${result.error.message}`)
    }

    return result.token
}

async function getTokenCookie(name: string, scope: string): Promise<ResponseCookie> {
    const token = await fetchToken(scope)
    return {
        name,
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    }
}

export async function setTokens() {
    const response = NextResponse.next()
    response.cookies.set(await getTokenCookie('api-token', requireEnv('API_SCOPE')))
    response.cookies.set(await getTokenCookie('utsjekk-api-token', requireEnv('UTSJEKK_API_SCOPE')))
    response.cookies.set(await getTokenCookie('vedskiva-api-token', requireEnv('VEDSKIVA_API_SCOPE')))
    return response
}
