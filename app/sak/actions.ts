'use server'

import { Routes } from '@/lib/api/routes'
import { checkToken } from '@/lib/auth/accessToken'
import { fetchApiToken } from '@/lib/auth/apiToken'
import { Message } from '@/app/kafka/types.ts'

type Sak = {
    sakId: string
    antallUtbetalinger: number
    fagsystem: string
}

type Saker = Sak[]

export const fetchSaker = async (): Promise<ApiResponse<Saker>> => {
    await checkToken()
    const token = await fetchApiToken()

    const response = await fetch(new URL(Routes.external.saker), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    })

    if (!response.ok) {
        console.error(response)
        return {
            data: null,
            error: {
                message: `Klarte ikke hente saker: ${response.status} - ${response.statusText}`,
                statusCode: response.status,
            },
        }
    }

    const saker = await response.json()

    return {
        data: deduplicateByHighestUtbetaling(
            saker.map((it: Message) => {
                const { sakId, fagsystem } = JSON.parse(it.key)
                const value = it.value && JSON.parse(it.value)
                const antallUtbetalinger = Array.isArray(value)
                    ? value.length
                    : value.uids?.length ?? 0
                return {
                    sakId,
                    fagsystem,
                    antallUtbetalinger: antallUtbetalinger,
                }
            })
        ),
        error: null,
    }
}

function deduplicateByHighestUtbetaling(saker: Sak[]): Sak[] {
    const map = new Map<string, Sak>()

    for (const sak of saker) {
        const key = `${sak.sakId}::${sak.fagsystem}`

        const existing = map.get(key)
        if (!existing || sak.antallUtbetalinger > existing.antallUtbetalinger) {
            map.set(key, sak)
        }
    }

    return Array.from(map.values())
}

export const fetchSak = async (sakId: string, fagsystem: string) => {
    await checkToken()
    const token = await fetchApiToken()

    const response = await fetch(Routes.external.sak(sakId, fagsystem), {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        return {
            data: null,
            error: {
                message: `Klarte ikke hente saker: ${response.status} - ${response.statusText}`,
                statusCode: response.status,
            },
        }
    }

    return {
        data: await response.json(),
        error: null,
    }
}
