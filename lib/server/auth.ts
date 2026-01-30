'use server'

import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'
import { expiresIn, getToken, requestAzureClientCredentialsToken, validateToken } from '@navikt/oasis'

import { Routes } from '@/lib/api/routes.ts'
import { isFaking, isLocal, requireEnv } from '@/lib/env.ts'

const API_TOKEN_NAME = 'api-token'

export async function aquireApiToken(headers: Headers) {
    const redirect = encodeURIComponent(headers.get('x-forwarded-uri') ?? headers.get('referer') ?? '/kafka')
    const url = new URL(`${Routes.internal.apiLogin}?redirect=${redirect}`, process.env.NEXT_PUBLIC_HOSTNAME)
    return NextResponse.redirect(url)
}

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

export const ensureValidApiToken = async () => {
    if (isFaking) {
        return
    }

    if (isLocal) {
        const existing = process.env.API_TOKEN
        if (!existing) {
            unauthorized()
        }
        return
    }

    const existing = await getApiTokenFromCookie()
    if (!existing) {
        return aquireApiToken(await headers())
    }
}

export const getApiTokenFromCookie = async () => {
    const cookieStore = await cookies()
    const existing = cookieStore.get(API_TOKEN_NAME)

    try {
        if (existing && expiresIn(existing.value) > 0) {
            return existing.value
        }
    } catch {}
    return null
}

export async function fetchApiToken(): Promise<string> {
    if (isFaking) {
        return Promise.resolve('')
    }

    if (isLocal) {
        const token = process.env.API_TOKEN
        if (!token) {
            unauthorized()
        }
        return token
    }

    const existing = await getApiTokenFromCookie()
    if (existing) {
        return existing
    }

    const currentHeaders = await headers()
    const token = getToken(currentHeaders)
    if (!token) {
        const forward = currentHeaders.get('x-forwarded-uri') || '/'
        return redirect(`/oauth2/login?redirect=${encodeURIComponent(forward)}`)
    }

    const scope = requireEnv('API_SCOPE')
    const result = await requestAzureClientCredentialsToken(scope)
    if (!result.ok) {
        logger.error(`Henting av api-token feilet: ${result.error.message}`)
        throw Error(`Henting av api-token feilet: ${result.error.message}`)
    }

    return result.token
}
