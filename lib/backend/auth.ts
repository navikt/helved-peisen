import { NextRequest, NextResponse } from 'next/server'
import { Routes } from '@/lib/api/routes.ts'

export function aquireApiToken(req: NextRequest) {
    return NextResponse.redirect(
        `${Routes.internal.apiLogin}?redirect=${encodeURIComponent(req.headers.get('referer') ?? '/')}`
    )
}
