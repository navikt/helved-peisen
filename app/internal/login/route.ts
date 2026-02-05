import { NextRequest, NextResponse } from 'next/server'
import { isLocal, requireEnv } from '@/lib/env'
import { fetchApiToken, fetchUtsjekkApiToken } from '@/lib/server/auth.ts'

export const GET = async (req: NextRequest) => {
    const path = req.nextUrl.searchParams.get('redirect') ?? req.headers.get('referer') ?? '/kafka'
    const host = requireEnv('NEXT_PUBLIC_HOSTNAME')
    const destination = new URL(path, host)
    const response = NextResponse.redirect(destination)
    const isHttps = req.nextUrl.protocol === 'https:'

    const apiToken = isLocal ? requireEnv('API_TOKEN') : await fetchApiToken()
    response.cookies.set({
        name: 'api-token',
        value: apiToken,
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
    })

    const utsjekkToken = isLocal ? requireEnv('UTSJEKK_API_TOKEN') : await fetchUtsjekkApiToken()
    response.cookies.set({
        name: 'utsjekk-api-token',
        value: utsjekkToken,
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        path: '/',
    })

    return response
}
