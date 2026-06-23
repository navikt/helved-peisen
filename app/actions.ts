'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { deleteSession } from '@/lib/server/session-store.ts'

export async function deleteApiToken() {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session-id')?.value
    if (sessionId) {
        await deleteSession(sessionId)
    }
    cookieStore.delete('session-id')
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
