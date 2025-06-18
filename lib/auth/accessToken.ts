import { isFaking, isLocal, requireEnv } from '@/lib/env.ts'
import { expiresIn, getToken, validateToken } from '@navikt/oasis'
import { cookies, headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'

const checkLocalToken = async () => {
    let token = (await cookies()).get('api-token')
    if (!token) {
        redirect('/internal/login')
    }
}

export const checkToken = async () => {
    if (isFaking) return

    if (isLocal) {
        return checkLocalToken()
    }

    const token = getToken(await headers())
    if (!token) {
        redirect(
            `/internal/login?redirect=${requireEnv('NEXT_PUBLIC_HOSTNAME')}`
        )
    }

    const result = await validateToken(token)
    if (!result.ok) {
        logger.warn(`Tokenvalidering gikk galt: ${result.error.message}`)
        unauthorized()
    }
}
