import { NextRequest, NextResponse } from 'next/server'
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

    const response = NextResponse.redirect(
        `${requireEnv('NEXT_PUBLIC_HOSTNAME')}`
    )

    response.cookies.set({
        name: 'api-token',
        value: await fetchApiToken(),
        httpOnly: true,
    })

    return response
}
