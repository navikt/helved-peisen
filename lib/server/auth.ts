'use server'

import { cookies, headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'
import { getToken, validateAzureToken, validateToken } from '@navikt/oasis'

import { isFaking, isLocal } from '@/lib/env.ts'
import { getSession, type TokenSession } from '@/lib/server/session-store.ts'

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

async function getTokenFromSession(key: keyof TokenSession): Promise<string | undefined> {
    if (isFaking) return (await cookies()).get(key)?.value
    const sessionId = (await cookies()).get('session-id')?.value
    if (!sessionId) return undefined
    const session = await getSession(sessionId)
    return session?.[key] ?? undefined
}

async function getAzureClaims(): Promise<{ groups: string[] } | null> {
    const currentHeaders = await headers()
    const token = getToken(currentHeaders)
    if (!token) return null

    const result = await validateAzureToken(token)
    if (!result.ok) return null

    return { groups: result.payload.groups ?? [] }
}

/**
 * Rollestyring er bare aktivert i dev (der ADMIN_GROUP_ID er satt). I prod har alle med tilgang til appen
 * admin-rettigheter, så der er ADMIN_GROUP_ID bevisst ikke satt
 */
export const isAdmin = async (): Promise<boolean> => {
    if (isFaking || isLocal) return true

    const adminGroupId = process.env.ADMIN_GROUP_ID
    if (!adminGroupId) return true

    const claims = await getAzureClaims()
    return claims?.groups.includes(adminGroupId) ?? false
}
/**
* Brukere i dev må være medlem av # 0000-CA-HelvedPeisen_admin i dev for å gjøre endringer (trykke på knapper)
*/
export const requireAdmin = async () => {
    if (!(await isAdmin())) {
        unauthorized()
    }
}

export const getApiToken = async () => getTokenFromSession('api-token')

export const getUtsjekkApiToken = async () => getTokenFromSession('utsjekk-api-token')

export const getVedskivaApiToken = async () => getTokenFromSession('vedskiva-api-token')

export const getSpeiderhyttaApiToken = async () => getTokenFromSession('speiderhytta-api-token')
