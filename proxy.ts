import { type NextRequest, NextResponse } from 'next/server'
import { expiresIn, requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import { isFaking, requireEnv } from '@/lib/env'

const isLocal = process.env.NODE_ENV !== 'production'

function isExpired(token: string) {
    return expiresIn(token) <= 0
}

function handleLocalApiToken() {
    const apiToken = process.env.API_TOKEN
    if (!apiToken || isExpired(apiToken)) return new NextResponse('Unauthorized', { status: 401 })

    const response = NextResponse.next()

    response.cookies.set({
        name: 'api-token',
        value: apiToken,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
    })

    return response
}

async function fetchToken(scope: string) {
    const result = await requestAzureClientCredentialsToken(scope)
    if (!result.ok) {
        logger.error(`Henting av token feilet: ${result.error.message}`)
        throw Error(`Henting av token feilet: ${result.error.message}`)
    }

    return result.token
}

async function handleApiTokens() {
    const response = NextResponse.next()

    const apiToken = await fetchToken(requireEnv('API_SCOPE'))
    response.cookies.set({
        name: 'api-token',
        value: apiToken,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })

    const utsjekkToken = await fetchToken(requireEnv('UTSJEKK_API_SCOPE'))
    response.cookies.set({
        name: 'utsjekk-api-token',
        value: utsjekkToken,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })

    return response
}

// noinspection JSUnusedGlobalSymbols
export async function proxy(req: NextRequest): Promise<NextResponse> {
    if (isFaking) {
        return NextResponse.next()
    }

    if (isLocal) {
        return handleLocalApiToken()
    }

    const apiToken = req.headers.get('api-token')
    const utsjekkToken = req.headers.get('utsjekk-api-token')

    if (!apiToken || isExpired(apiToken) || !utsjekkToken || isExpired(utsjekkToken)) {
        return handleApiTokens()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|internal|oauth2).*)'],
}
