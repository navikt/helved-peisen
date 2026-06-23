import { type NextRequest, NextResponse } from 'next/server'

import { isFaking } from '@/lib/env'
import { setDevTokens } from '@/lib/server/dev-token.ts'
import { setTokens } from '@/lib/server/token.ts'
import { getSession } from '@/lib/server/session-store.ts'

const isLocal = process.env.NODE_ENV !== 'production'

// noinspection JSUnusedGlobalSymbols
export async function proxy(req: NextRequest): Promise<NextResponse> {
    if (isFaking) {
        return NextResponse.next()
    }

    const sessionId = req.cookies.get('session-id')?.value
    const session = sessionId ? await getSession(sessionId) : null

    if (!session) {
        return isLocal ? setDevTokens() : setTokens()
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|internal|oauth2).*)'],
}
