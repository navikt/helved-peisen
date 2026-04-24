'use server'

import { unauthorized } from 'next/navigation'
import { logger } from '@navikt/next-logger'

import { getSpeiderhyttaApiTokenFromCookie } from '@/lib/server/auth.ts'
import { Routes } from '@/lib/api/routes.ts'
import { ApiResponse } from '@/lib/api/types.ts'
import { DoraResponse } from './types'

export async function isSpeiderhyttaAvailable(): Promise<boolean> {
    return !!process.env.SPEIDERHYTTA_BASE_URL
}

async function speiderhyttaFetch(url: string, label: string): Promise<ApiResponse<DoraResponse[]>> {
    if (!process.env.SPEIDERHYTTA_BASE_URL) {
        return {
            data: null,
            error: 'speiderhytta er ikke tilgjengelig i dette miljøet',
        }
    }

    const token = await getSpeiderhyttaApiTokenFromCookie()
    if (!token) return unauthorized()

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    })

    if (!res.ok) {
        logger.error(`Klarte ikke hente ${label}: ${res.status} - ${res.statusText}`)
        return {
            data: null,
            error: `Klarte ikke hente ${label}: ${res.status} - ${res.statusText}`,
        }
    }

    return { data: await res.json(), error: null }
}

export async function fetchDoraAll() {
    return speiderhyttaFetch(Routes.dora, 'DORA-metrikker')
}

export async function fetchDoraApp(app: string, window?: string) {
    return speiderhyttaFetch(Routes.doraApp(app, window), `DORA-metrikker for ${app}`)
}

export async function fetchDoraDeployments(app: string, limit: number = 50) {
    return speiderhyttaFetch(Routes.doraDeployments(app, limit), `deploys for ${app}`)
}

export async function fetchDoraIncidents(app: string, limit: number = 50) {
    return speiderhyttaFetch(Routes.doraIncidents(app, limit), `incidents for ${app}`)
}
