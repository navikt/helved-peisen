import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/auth/apiToken.ts'
import { sanitizeKey, toMessage } from '@/lib/backend/message'
import { logger } from '@navikt/next-logger'
import { NextRequest, NextResponse } from 'next/server'
import type { RawMessage } from '@/app/kafka/types.ts'
import { aquireApiToken } from '@/lib/backend/auth.ts'

export async function GET(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return aquireApiToken(req)

    const { sakId, fagsystem } = await params
    const res = await fetch(Routes.external.sak(encodeURIComponent(sakId), fagsystem), {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        logger.error(`Klarte ikke hente hendelser for sak: ${res.status} - ${res.statusText}`)
        return NextResponse.json(
            {
                data: null,
                error: { message: `Klarte ikke hente hendelser for sak: ${res.status} - ${res.statusText}` },
            },
            { status: res.status }
        )
    }

    const data = await res.json()
    const sanitized = data.map((it: RawMessage) => sanitizeKey(toMessage(it)))

    return NextResponse.json({ data: sanitized, error: null })
}
