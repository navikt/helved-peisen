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
    await checkPeisToken()
    const token = await fetchApiToken()
    const peisToken = await fetchPeisApiToken()
    await updateCookieToken(token)
    await updatePeisCookieToken(peisToken)

    return NextResponse.redirect(requireEnv('NEXT_PUBLIC_HOSTNAME'))
}
