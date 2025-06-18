import { NextRequest, NextResponse } from 'next/server'
import { fetchApiToken as fetchUtsjekkToken } from '@/lib/auth/token.ts'
import { fetchApiToken } from '@/lib/auth/apiToken.ts'
import { isLocal, requireEnv } from '@/lib/env'

const handleLocalLogin = () => {
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

    const searchParams = new URL(req.url).searchParams
    const pathname =
        searchParams.size > 0
            ? '/oauth2/login?' + searchParams.toString()
            : '/oauth2/login'
    const response = NextResponse.redirect(
        `${requireEnv('NEXT_PUBLIC_HOSTNAME')}${pathname}`
    )

    response.cookies.set({
        name: 'utsjekk-token',
        value: await fetchUtsjekkToken(),
        httpOnly: true,
    })

    response.cookies.set({
        name: 'api-token',
        value: await fetchApiToken(),
        httpOnly: true,
    })

    return response
}
