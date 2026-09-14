import type { RawMessage } from '@/app/kafka/types.ts'
import { Routes } from '@/lib/api/routes'
import { getApiToken } from '@/lib/server/auth.ts'
import { badgeForMessage } from '@/lib/server/message.ts'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const apiToken = await getApiToken()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    try {
        const response = await fetch(`${Routes.dashboard}?${searchParams.toString()}`, {
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

        const data = await response.json()

        return NextResponse.json({
            data: {
                ...data,
                feiletUtbetalinger: (data.feiletUtbetalinger ?? []).map((message: RawMessage) => ({
                    ...message,
                    badge: badgeForMessage(message),
                })),
            },
            error: null,
        })
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return NextResponse.json({ data: null, error: 'Aborted' }, { status: 408 })
        }

        return NextResponse.json({ data: null, error: 'Uventet feil ved henting av meldinger' }, { status: 500 })
    }
}
