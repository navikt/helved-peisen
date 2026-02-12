import { NextRequest, NextResponse } from 'next/server'
import { Routes } from '@/lib/api/routes'
import { logger } from '@navikt/next-logger'
import { sanitizeKey, toMessage } from '@/lib/server/message'
import { getApiTokenFromCookie } from '@/lib/server/auth'
import { unauthorized } from 'next/navigation'

export async function GET(req: NextRequest) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const searchParams = req.nextUrl.searchParams
    const response = await fetch(`${Routes.external.kafka}/messages?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!response.ok) {
        logger.error(`Klarte ikke hente meldinger: ${response.status} - ${response.statusText}`)
        return response
    }

    const page = await response.json()
    const sanitized = { items: page.items.map(toMessage).map(sanitizeKey), total: page.total }

    return NextResponse.json({ data: sanitized, error: null })
}
