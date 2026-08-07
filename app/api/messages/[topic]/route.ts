import { Routes } from '@/lib/api/routes'
import { getApiToken } from '@/lib/server/auth'
import { NextResponse } from 'next/server'

type PathParams = {
    topic: string
}

export async function GET(request: Request, { params }: { params: Promise<PathParams> }) {
    const apiToken = await getApiToken()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { topic } = await params

    try {
        const response = await fetch(`${Routes.messages}/${topic}?${searchParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            signal: request.signal,
            cache: 'no-store',
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
