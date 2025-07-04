import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { isFaking } from '@/lib/env'

const isLocal = process.env.NODE_ENV !== 'production'

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const url = new URL(request.url)

    if (isFaking || isLocal) {
        return NextResponse.next()
    }

    if (!(await headers()).has('Authorization')) {
        return NextResponse.redirect(
            new URL(
                `${process.env.NEXT_PUBLIC_HOSTNAME}/oauth2/login?redirect=${url.pathname}`,
                request.url
            )
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|internal|oauth2).*)'],
}
