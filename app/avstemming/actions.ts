'use server'

import { getVedskivaApiTokenFromCookie } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import { AvstemmingRequest, AvstemmingResponse } from '@/app/avstemming/types.ts'
import { ApiResponse } from '@/lib/api/types.ts'
import { unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'

type AvstemmingDryrunResponse = {
    first: string
    second: string[]
}[]

export async function fetchAvstemmingDryrunV2(
    range: AvstemmingRequest
): Promise<ApiResponse<AvstemmingDryrunResponse>> {
    const apiToken = await getVedskivaApiTokenFromCookie()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.avstemmingDryrunv2, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(range),
    })

    if (!res.ok) {
        logger.error(`Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`)
        return {
            data: null,
            error: `Klarte ikke kjøre dryrun avstemming: ${res.status} - ${res.statusText}`,
        }
    }

    const data = await res.json()

    return { data, error: null }
}
