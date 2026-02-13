'use server'

import { cookies, headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'
import { getToken, validateToken } from '@navikt/oasis'

import { isFaking, isLocal } from '@/lib/env.ts'

export const checkToken = async () => {
    if (isFaking || isLocal) return

    const currentHeaders = await headers()
    const token = getToken(currentHeaders)
    if (!token) {
        const forward = currentHeaders.get('x-forwarded-uri') || '/'
        return redirect(`/oauth2/login?redirect=${encodeURIComponent(forward)}`)
    }

    const result = await validateToken(token)
    if (!result.ok) {
        logger.warn(`Tokenvalidering gikk galt: ${result.error.message}`)
        unauthorized()
    }
}

export const getApiTokenFromCookie = async () => (await cookies()).get('api-token')?.value

export const getUtsjekkApiTokenFromCookie = async () => (await cookies()).get('utsjekk-api-token')?.value

export const getVedskivaApiTokenFromCookie = async () => (await cookies()).get('vedskiva-api-token')?.value
