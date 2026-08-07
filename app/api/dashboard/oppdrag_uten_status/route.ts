import { Routes } from '@/lib/api/routes'
import { getApiToken } from '@/lib/server/auth.ts'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const apiToken = await getApiToken()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    try {
        const response = await fetch(`${Routes.dashboard}/oppdrag_uten_status?${searchParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            signal: request.signal,
        })

        if (!response.ok) {
            return NextResponse.json(
                {
                    data: null,
                    error: `Klarte ikke hente meldinger, backend svarte med ${response.status} - ${response.statusText}`,
                },
                { status: response.status }
            )
        }

        return NextResponse.json({
            data: await response.json(),
            error: null,
        })
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return NextResponse.json({ data: null, error: 'Aborted' }, { status: 408 })
        }

        return NextResponse.json({ data: null, error: 'Uventet feil ved henting av meldinger' }, { status: 500 })
    }
}
