import { describe, test } from 'vitest'
import { http, HttpResponse } from 'msw'
import { Routes } from '@/lib/api/routes.ts'
import { getMessagesByTopic } from './getMessagesByTopic'
import { expect } from '@playwright/test'
import { server } from '@/fakes/msw/server.ts'

describe.skip('getMessagesByTopic', () => {
    test('tar hensyn til "fom" = "now"', async () => {
        let actualFom: string | null = null
        server.use(
            http.get(
                Routes.external.kafka,
                ({ request }) => {
                    const url = new URL(request.url)
                    actualFom = url.searchParams.get('fom')
                    return new HttpResponse(JSON.stringify([]), { status: 200 })
                },
                { once: true }
            )
        )

        const response = await getMessagesByTopic('?fom=now')

        expect(response.error).toBeNull()
        expect(actualFom).not.toBeNull()
    })

    test('tar hensyn til "tom" = "now"', async () => {
        let actualTom: string | null = null
        server.use(
            http.get(
                Routes.external.kafka,
                ({ request }) => {
                    const url = new URL(request.url)
                    actualTom = url.searchParams.get('tom')
                    return new HttpResponse(JSON.stringify([]), { status: 200 })
                },
                { once: true }
            )
        )

        const response = await getMessagesByTopic('?tom=now')

        expect(response.error).toBeNull()
        expect(actualTom).not.toBeNull()
    })

    test('returnerer error', async () => {
        server.use(
            http.get(
                Routes.external.kafka,
                () => {
                    return new HttpResponse(JSON.stringify([]), { status: 500 })
                },
                { once: true }
            )
        )

        const response = await getMessagesByTopic('?tom=now')

        expect(response.data).toBeNull()
        expect(response.error).not.toBeNull()
    })

    test('hensyntar "fom" og "tom" i search params', async () => {
        let receivedSearchParams: URLSearchParams | null = null
        server.use(
            http.get(
                Routes.external.kafka,
                ({ request }) => {
                    const url = new URL(request.url)
                    receivedSearchParams = url.searchParams
                    return new HttpResponse(JSON.stringify([]), { status: 200 })
                },
                { once: true }
            )
        )

        const fom = new Date().toISOString()
        const tom = new Date().toISOString()
        const response = await getMessagesByTopic(`?fom=${fom}&tom=${tom}`)

        expect(response.error).toBeNull()
        expect(receivedSearchParams).not.toBeNull()
        expect(receivedSearchParams!.get('fom')).toEqual(fom)
        expect(receivedSearchParams!.get('tom')).toEqual(tom)
    })
})
