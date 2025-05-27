import { NextRequest, NextResponse } from 'next/server'

import { checkToken, fetchApiToken, updateCookie } from '@/lib/auth/apiToken'
import { requireEnv } from '@/lib/env'

export const GET = async (_: NextRequest) => {
    await checkToken()
    const apiToken = await fetchApiToken()
    await updateCookie(apiToken)

    return NextResponse.redirect(requireEnv('NEXT_PUBLIC_HOSTNAME'))
}
