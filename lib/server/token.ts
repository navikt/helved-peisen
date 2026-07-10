import { NextResponse } from 'next/server'
import { expiresIn, getToken, requestAzureOboToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'
import { requireEnv } from '@/lib/env.ts'
import { headers } from 'next/headers'
import { createSession, type TokenSession } from '@/lib/server/session-store.ts'

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

export async function setTokens() {
    const response = NextResponse.next()

    const apiToken = await fetchToken(requireEnv('API_SCOPE'))
    const utsjekkToken = await fetchToken(requireEnv('UTSJEKK_API_SCOPE'))
    const vedskivaToken = await fetchToken(requireEnv('VEDSKIVA_API_SCOPE'))
    const speiderhyttaScope = process.env.SPEIDERHYTTA_API_SCOPE
    const speiderhyttaToken = speiderhyttaScope ? await fetchToken(speiderhyttaScope) : undefined

    if (!apiToken || !utsjekkToken || !vedskivaToken) return response

    const tokens: TokenSession = {
        'api-token': apiToken,
        'utsjekk-api-token': utsjekkToken,
        'vedskiva-api-token': vedskivaToken,
        ...(speiderhyttaToken ? { 'speiderhytta-api-token': speiderhyttaToken } : {}),
    }

    const ttl = Math.max(
        0,
        Math.min(
            ...[apiToken, utsjekkToken, vedskivaToken, speiderhyttaToken]
                .filter((t): t is string => !!t)
                .map(expiresIn)
        ) - 60
    )
    const expiresAt = new Date(Date.now() + ttl * 1000)

    const sessionId = await createSession(tokens, ttl)

    response.cookies.set({
        name: 'session-id',
        value: sessionId,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
    })

    return response
}
