import type { RawMessage } from '@/app/kafka/types'
import { Routes } from '@/lib/api/routes'
import { getApiTokenFromCookie } from '@/lib/server/auth'
import { toMessages } from '@/lib/server/message'
import { NextResponse } from 'next/server'
import type { PaginatedResponse } from '@/lib/api/types.ts'

export async function GET(request: Request) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    try {
        const response = await fetch(`${Routes.messages}?${searchParams.toString()}`, {
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

        const page: PaginatedResponse<RawMessage> = await response.json()

        return NextResponse.json({
            data: {
                items: toMessages(page.items),
                total: page.total,
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
