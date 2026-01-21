import { NextResponse } from 'next/server'
import { Routes } from '@/lib/api/routes.ts'

export function aquireApiToken(headers: Headers) {
    return NextResponse.redirect(
        `${Routes.internal.apiLogin}?redirect=${encodeURIComponent(headers.get('referer') ?? '/')}`
    )
}
