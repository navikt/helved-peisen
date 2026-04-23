import { NextResponse } from 'next/server'
import { getToken, requestAzureOboToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'
import { requireEnv } from '@/lib/env.ts'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { headers } from 'next/headers'

async function fetchToken(scope: string) {
    const token = getToken(await headers())
    if (!token) return

    const result = await requestAzureOboToken(token, scope)
    if (!result.ok) {
        logger.error(`Henting av token feilet: ${result.error.message}`)
        throw Error(`Henting av token feilet: ${result.error.message}`)
    }

    return result.token
}

async function getTokenCookie(name: string, scope: string): Promise<ResponseCookie | undefined> {
    const token = await fetchToken(scope)
    if (!token) return
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
    const apiToken = await getTokenCookie('api-token', requireEnv('API_SCOPE'))
    const utsjekkToken = await getTokenCookie('utsjekk-api-token', requireEnv('UTSJEKK_API_SCOPE'))
    const vedskivaToken = await getTokenCookie('vedskiva-api-token', requireEnv('VEDSKIVA_API_SCOPE'))
    const speiderhyttaToken = await getTokenCookie('speiderhytta-api-token', requireEnv('SPEIDERHYTTA_API_SCOPE'))

    if (!!apiToken) {
        response.cookies.set(apiToken)
    }
    if (!!utsjekkToken) {
        response.cookies.set(utsjekkToken)
    }
    if (!!vedskivaToken) {
        response.cookies.set(vedskivaToken)
    }
    if (!!speiderhyttaToken) {
        response.cookies.set(speiderhyttaToken)
    }
    return response
}
