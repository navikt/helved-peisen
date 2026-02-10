import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@navikt/next-logger'
import { Routes } from '@/lib/api/routes'
import { fetchVedskivaApiToken } from '@/lib/server/auth'

export async function POST(req: NextRequest) {
    const apiToken = await fetchVedskivaApiToken()
    const { today } = await req.json()

    const res = await fetch(Routes.external.avstemmingNextRange, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(today),
    })

    if (!res.ok) {
        logger.error(`Klarte ikke hente next_range: ${res.status} - ${res.statusText}`)
        return NextResponse.json(
            { data: null, error: { message: `Klarte ikke hente next_range: ${res.status}` } },
            { status: res.status }
        )
    }

    const data = await res.json()
    return NextResponse.json({ data, error: null })
}