import { NextResponse } from 'next/server'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

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

async function getDevTokenCookie(name: string, aud: string): Promise<ResponseCookie> {
    const token = await fetchDevToken(aud)
    return {
        name,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
    }
}

export async function setDevTokens() {
    const response = NextResponse.next()
    response.cookies.set(await getDevTokenCookie('api-token', 'dev-gcp.helved.peisschtappern'))
    response.cookies.set(await getDevTokenCookie('utsjekk-api-token', 'dev-gcp.helved.utsjekk'))
    return response
}
