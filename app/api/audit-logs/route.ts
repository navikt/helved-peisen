import { NextRequest, NextResponse } from 'next/server'
import { getApiToken } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import type { AuditLogPage } from '@/app/audit/logs/types.ts'

export async function GET(req: NextRequest) {
    const apiToken = await getApiToken()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const fom = searchParams.get('fom')
    const tom = searchParams.get('tom')
    const pageToken = searchParams.get('pageToken')
    const pageSize = searchParams.get('pageSize')

    const params = new URLSearchParams()
    if (fom) params.set('fom', fom)
    if (tom) params.set('tom', tom)
    if (pageToken) params.set('pageToken', pageToken)
    if (pageSize) params.set('pageSize', pageSize)

    const url = `${Routes.auditLogs}?${params.toString()}`

    try {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${apiToken}` },
            signal: req.signal,
            cache: 'no-store',
        })

        if (!res.ok) {
            const body = await res.text().catch(() => '')
            return NextResponse.json(
                {
                    data: null,
                    error: `Klarte ikke hente audit-logger: ${res.status} - ${body || res.statusText}`,
                },
                { status: res.status }
            )
        }

        const data: AuditLogPage = await res.json()
        return NextResponse.json({ data, error: null })
    } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
            return NextResponse.json({ data: null, error: 'Aborted' }, { status: 408 })
        }
        return NextResponse.json({ data: null, error: 'Uventet feil ved henting av audit-logger' }, { status: 500 })
    }
}
