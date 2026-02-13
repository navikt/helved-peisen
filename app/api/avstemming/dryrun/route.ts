import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'
import { Routes } from '@/lib/api/routes'
import { getVedskivaApiTokenFromCookie } from '@/lib/server/auth'

export async function POST(req: NextRequest) {
    const apiToken = await getVedskivaApiTokenFromCookie()

    const body = await req.json()

    const res = await fetch(Routes.external.avstemmingDryrun, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        logger.error(`Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`)
        return NextResponse.json(
            {
                data: null,
                error: { message: `Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}` },
            },
            { status: res.status }
        )
    }

    const data = await res.json()
    return NextResponse.json({ data, error: null })
}
