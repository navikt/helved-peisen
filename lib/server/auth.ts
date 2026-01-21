import { NextResponse } from 'next/server'
import { Routes } from '@/lib/api/routes.ts'

export function aquireApiToken(headers: Headers) {
    const redirect = encodeURIComponent(headers.get('x-forwarded-uri') ?? headers.get('referer') ?? '/kafka')
    const url = new URL(`${Routes.internal.apiLogin}?redirect=${redirect}`, process.env.NEXT_PUBLIC_HOSTNAME)
    return NextResponse.redirect(url)
}
