'use server'

import { getVedskivaApiToken } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import { AvstemmingRequest } from '@/app/avstemming/types.ts'
import { ApiResponse } from '@/lib/api/types.ts'
import { unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'

type Response = {
    first: string
    second: string[]
}[]

export async function fetchAvstemmingDryrunV2(range: AvstemmingRequest): Promise<ApiResponse<Response>> {
    const apiToken = await getVedskivaApiToken()
    if (!apiToken) return unauthorized()

    const res = await fetch(Routes.avstemmingDryrun, {
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
