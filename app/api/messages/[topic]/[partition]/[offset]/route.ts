import { NextRequest, NextResponse } from 'next/server'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'

type PathParams = {
    topic: string
    partition: string
    offset: string
}

export async function GET(_: NextRequest, { params }: { params: Promise<PathParams> }) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) {
        return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, partition, offset } = await params

    console.log('HENTER MELDING')

    const res = await fetch(`${Routes.messages}/${topic}/${partition}/${offset}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return NextResponse.json({
            data: null,
            error: `Klarte ikke hente melding: ${res.status} - ${res.statusText}`,
        })
    }

    return NextResponse.json({
        data: await res.json(),
        error: null,
    })
}
