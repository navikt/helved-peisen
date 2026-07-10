import { NextRequest, NextResponse } from 'next/server'
import { getApiToken } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'

export async function GET(req: NextRequest) {
    const apiToken = await getApiToken()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const url = `${Routes.avstemminger}?${searchParams.toString()}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return NextResponse.json({
            data: null,
            error: `Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}`,
        })
    }

    const data: { value: string }[] = await res.json()
    return NextResponse.json({ data: data.map((it) => it.value), error: null })
}
