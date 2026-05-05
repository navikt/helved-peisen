'use server'

import { cookies, headers } from 'next/headers'
import { redirect, unauthorized } from 'next/navigation'

import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { ApiResponse } from '@/lib/api/types'

export async function auditTest(reason: string): Promise<ApiResponse<string>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.auditTest, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke kalle audit-test: ${res.status} - ${res.statusText}`,
        }
    }

    return { data: await res.text(), error: null }
}

export async function deleteApiToken() {
    ;(await cookies()).delete('api-token')
}

export async function getUser(): Promise<{
    name: string
    email: string
    ident: string
}> {
    if (process.env.NODE_ENV === 'development') {
        return {
            name: `Navn Navnesen`,
            email: 'dev@localhost',
            ident: 'A12345',
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
    }
}
