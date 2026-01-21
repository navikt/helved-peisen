import { NextRequest, NextResponse } from 'next/server'
import { fetchApiToken } from '@/lib/auth/apiToken.ts'
import { isLocal, requireEnv } from '@/lib/env'

function handleLocalLogin() {
    const response = NextResponse.redirect(requireEnv('NEXT_PUBLIC_HOSTNAME'))
    response.cookies.set({
        name: 'api-token',
        value: requireEnv('API_TOKEN'),
        httpOnly: true,
    })
    return response
}

export const GET = async (req: NextRequest) => {
    if (isLocal) {
        return handleLocalLogin()
    }
    const path = req.nextUrl.searchParams.get('redirect') ?? req.headers.get('referer') ?? '/kafka'
    const host = requireEnv('NEXT_PUBLIC_HOSTNAME')
    const destination = new URL(path, host)
    const response = NextResponse.redirect(destination)

    response.cookies.set({
        name: 'api-token',
        value: await fetchApiToken(),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
    })

    return response
}
