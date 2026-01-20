import { NextRequest, NextResponse } from 'next/server'
import { Routes } from '@/lib/api/routes.ts'
import { getApiTokenFromCookie } from '@/lib/auth/apiToken.ts'
import { logger } from '@navikt/next-logger'
import { format } from 'url'

export async function GET(_: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return NextResponse.redirect('/internal/login')

    const { topic, partition, offset } = await params
    const res = await fetch(`${Routes.external.kafka}/${topic}/${partition}/${offset}`, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        logger.error(`Klarte ikke hente melding: ${res.status} - ${res.statusText}`)
        return NextResponse.json({
            data: null,
            error: {
                message: `Klarte ikke hente melding: ${res.status} - ${res.statusText}`,
                statusCode: res.status,
            },
        })
    }

    const data = await res.json()

    return NextResponse.json({ data, error: null })
}

export async function POST(_: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return NextResponse.redirect('/internal/login')

    const { topic, partition, offset } = await params
    const formData = new FormData()
    formData.set('topic', encodeURIComponent(topic))
    formData.set('partition', partition)
    formData.set('offset', offset)
    const res = await fetch(`${Routes.external.resend}`, {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData)),
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!res.ok) {
        console.log(await res.text())
        logger.error(`Klarte ikke resende melding: ${res.status} - ${res.statusText}`)
        return NextResponse.json(
            {
                data: null,
                error: {
                    message: `Klarte ikke resende melding: ${res.status} - ${res.statusText}`,
                    statusCode: res.status,
                },
            },
            {
                status: res.status,
            }
        )
    }

    return NextResponse.json({ data: null, error: null })
}
