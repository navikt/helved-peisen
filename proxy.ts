import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isFaking } from '@/lib/env'
import { fetchApiToken, fetchUtsjekkApiToken } from '@/lib/server/auth.ts'
import { expiresIn } from '@navikt/oasis'

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

async function handleApiTokens() {
    const response = NextResponse.next()

    const apiToken = await fetchApiToken()
    response.cookies.set({
        name: 'api-token',
        value: apiToken,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })

    const utsjekkToken = await fetchUtsjekkApiToken()
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
export async function proxy(request: NextRequest): Promise<NextResponse> {
    if (isFaking) {
        return NextResponse.next()
    }

    if (isLocal) {
        return handleLocalApiToken()
    }

    const apiToken = request.headers.get('api-token')
    const utsjekkToken = request.headers.get('utsjekk-api-token')

    if (!apiToken || isExpired(apiToken) || !utsjekkToken || isExpired(utsjekkToken)) {
        return handleApiTokens()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|internal|oauth2).*)'],
}
