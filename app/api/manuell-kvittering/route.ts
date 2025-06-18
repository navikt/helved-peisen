import { NextRequest } from 'next/server'
import { ensureValidApiToken, getApiTokenFromCookie } from '@/lib/auth/apiToken'
import { checkToken } from '@/lib/auth/accessToken.ts'

export async function POST(request: NextRequest) {
    await checkToken()
    await ensureValidApiToken()

    const apiToken = await getApiTokenFromCookie()
    const body = await request.json()

    return fetch(`${process.env.API_BASE_URL}/api/manuell-kvittering`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
}
