'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

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
