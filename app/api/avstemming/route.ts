import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'
import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { unauthorized } from 'next/navigation'

export async function GET(req: NextRequest) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const searchParams = req.nextUrl.searchParams
    const fom = searchParams.get('fom')
    const tom = searchParams.get('tom')

    if (!fom || !tom) {
        return NextResponse.json(
            { data: null, error: { message: 'Missing required parameters: fom and tom' } },
            { status: 400 }
        )
    }

    const url = `${Routes.external.avstemminger}?fom=${encodeURIComponent(fom)}&tom=${encodeURIComponent(tom)}`
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        logger.error(`Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}`)
        return NextResponse.json(
            { data: null, error: { message: `Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}` } },
            { status: res.status }
        )
    }

    const data = await res.json()
    return NextResponse.json({ data, error: null })
}
