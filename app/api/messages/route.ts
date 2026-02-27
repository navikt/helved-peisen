import { getApiTokenFromCookie } from '@/lib/server/auth'
import { NextRequest, NextResponse } from 'next/server'
import { Routes } from '@/lib/api/routes.ts'
import { sanitizeKey, toMessage } from '@/lib/server/message'
import { unauthorized } from 'next/navigation'

export async function GET(req: NextRequest) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const searchParams = req.nextUrl.searchParams || {}

    const response = await fetch(`${Routes.external.messages}?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!response.ok) {
        return NextResponse.json({
            data: null,
            error: `Klarte ikke hente meldinger, backend svarte med ${response.status} - ${response.statusText}`,
        })
    }

    const page = await response.json()

    return NextResponse.json({
        data: {
            items: page.items.map(toMessage).map(sanitizeKey),
            total: page.total,
        },
    })
}
