import { NextRequest, NextResponse } from 'next/server'
import { checkToken, fetchApiToken, updateCookieToken } from '@/lib/auth/token'
import {
    checkToken as checkPeisToken,
    fetchApiToken as fetchPeisApiToken,
    updateCookieToken as updatePeisCookieToken,
} from '@/lib/auth/peisschtappernToken'

import { requireEnv } from '@/lib/env'

export const GET = async (_: NextRequest) => {
    await checkToken()
    const token = await fetchApiToken()
    await updateCookieToken(token)

    await checkPeisToken()
    const peisToken = await fetchPeisApiToken()
    await updatePeisCookieToken(peisToken)

    return NextResponse.redirect(requireEnv('NEXT_PUBLIC_HOSTNAME'))
}
