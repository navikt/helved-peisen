import { NextRequest } from 'next/server'
import { checkToken, fetchApiToken } from '@/lib/auth/peisschtappernToken.ts'

export async function POST(request: NextRequest) {
    await checkToken()

    const apiToken = await fetchApiToken()
    const body = await request.json()

    return fetch(
        `${process.env.PEISSCHTAPPERN_API_BASE_URL}/manuell-kvittering`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            body: JSON.stringify(body),
        }
    )
}
