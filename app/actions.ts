'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { deleteSession } from '@/lib/server/session-store.ts'
import { getApiToken, isAdmin } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import type { ApiResponse } from '@/lib/api/types.ts'

export async function deleteApiToken() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session-id')?.value
    if (sessionId) {
        await deleteSession(sessionId)
    }
    cookieStore.delete('session-id')
}

export async function fetchTopics(): Promise<ApiResponse<string[]>> {
    const apiToken = await getApiToken()
    if (!apiToken) {
        return {
            data: null,
            error: 'Klarte ikke hente topics: mangler API-token',
        }
    }

    const res = await fetch(Routes.topics, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke hente topics: ${res.status} - ${res.statusText}`,
        }
    }

    return {
        data: (await res.json()) as string[],
        error: null,
    }
}

export async function getUser(): Promise<{
    name: string
    email: string
    ident: string
    isAdmin: boolean
}> {
    if (process.env.NODE_ENV === 'development') {
        return {
            name: `Navn Navnesen`,
            email: 'dev@localhost',
            ident: 'A12345',
            isAdmin: true,
        }
    }

    const authHeader = (await headers()).get('Authorization')
    if (!authHeader) {
        const currentHeaders = await headers()
        const forward = currentHeaders.get('x-forwarded-uri') || '/'
        redirect(`/oauth2/login?redirect=${encodeURIComponent(forward)}`)
    }

    const token = authHeader.replace('Bearer ', '')
    const jwtPayload = token.split('.')[1]
    const payload = JSON.parse(Buffer.from(jwtPayload, 'base64').toString())

    const name = payload.name
    const email = payload.preferred_username.toLowerCase()
    const ident = payload.NAVident

    return {
        name,
        email,
        ident,
        isAdmin: await isAdmin(),
    }
}
