'use server'

import { subDays } from 'date-fns/subDays'
import { getApiTokenFromCookie } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import type { RawAvstemmingMessage } from '@/app/avstemming/types.ts'
import { ApiResponse } from '@/lib/api/types.ts'
import { unauthorized } from 'next/navigation'

export async function fetchAvstemminger(dager: number = 14): Promise<ApiResponse<string[]>> {
    const apiToken = await getApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const tom = new Date().toISOString()
    const fom = subDays(new Date(), dager).toISOString()

    const url = `${Routes.external.avstemminger}?fom=${encodeURIComponent(fom)}&tom=${encodeURIComponent(tom)}`

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiToken}` },
    })

    if (!res.ok) {
        return {
            data: null,
            error: `Klarte ikke hente avstemminger: ${res.status} - ${res.statusText}`,
        }
    }

    const data: RawAvstemmingMessage[] = await res.json()

    return {
        data: data.map((message) => message.value),
        error: null,
    }
}
