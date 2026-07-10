import { NextResponse } from 'next/server'
import { createSession } from '@/lib/server/session-store.ts'

const DEV_SESSION_TTL_SECONDS = 3600

async function fetchDevToken(aud: string) {
    const url = new URL(`https://azure-token-generator.intern.dev.nav.no/api/public/m2m?aud=${aud}`)
    const data = new FormData()
    data.append('aud', aud)

    const response = await fetch(url.toString(), {
        method: 'POST',
        body: data,
    })
    if (!response.ok) {
        throw Error(`Henting av dev-token feilet: ${response.statusText}`)
    }
    return await response.text()
}

export async function setDevTokens() {
    const response = NextResponse.next()

    const [apiToken, utsjekkToken, vedskivaToken] = await Promise.all([
        fetchDevToken('dev-gcp.helved.peisschtappern'),
        fetchDevToken('dev-gcp.helved.utsjekk'),
        fetchDevToken('dev-gcp.helved.vedskiva'),
    ])

    const expiresAt = new Date(Date.now() + DEV_SESSION_TTL_SECONDS * 1000)

    const sessionId = await createSession(
        {
            'api-token': apiToken,
            'utsjekk-api-token': utsjekkToken,
            'vedskiva-api-token': vedskivaToken,
        },
        DEV_SESSION_TTL_SECONDS
    )

    response.cookies.set({
        name: 'session-id',
        value: sessionId,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
    })

    return response
}
