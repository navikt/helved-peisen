import { NextRequest, NextResponse } from 'next/server'
import { getApiTokenFromCookie } from '@/lib/auth/apiToken.ts'
import { Routes } from '@/lib/api/routes'
import { logger } from '@navikt/next-logger'
import { sanitizeKey, toMessage } from '@/lib/backend/message.ts'
import { aquireApiToken } from '@/lib/backend/auth'

export async function GET(req: NextRequest) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return aquireApiToken(req)

    const searchParams = req.nextUrl.searchParams
    const response = await fetch(`${Routes.external.kafka}?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!response.ok) {
        logger.error(`Klarte ikke hente meldinger: ${response.status} - ${response.statusText}`)
        return NextResponse.json({
            data: null,
            error: {
                message: 'Klarte ikke hente meldinger: ${response.status} - ${response.statusText}',
                statusCode: response.status,
            },
        })
    }

    const data = await response.json()
    const sanitized = data.map(toMessage).map(sanitizeKey)

    return NextResponse.json({ data: sanitized, error: null })
}
