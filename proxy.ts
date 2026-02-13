import { type NextRequest, NextResponse } from 'next/server'
import { expiresIn } from '@navikt/oasis'

import { isFaking } from '@/lib/env'
import { setDevTokens } from '@/lib/server/dev-token.ts'
import { setTokens } from '@/lib/server/token.ts'

const isLocal = process.env.NODE_ENV !== 'production'

function isExpired(token: string) {
    return expiresIn(token) <= 0
}

// noinspection JSUnusedGlobalSymbols
export async function proxy(req: NextRequest): Promise<NextResponse> {
    if (isFaking) {
        return NextResponse.next()
    }

    const apiToken = req.cookies.get('api-token')
    const utsjekkToken = req.cookies.get('utsjekk-api-token')

    if (!apiToken || isExpired(apiToken.value) || !utsjekkToken || isExpired(utsjekkToken.value)) {
        return isLocal ? setDevTokens() : setTokens()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|internal|oauth2).*)'],
}
