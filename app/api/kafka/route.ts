import { NextRequest } from 'next/server'
import { checkToken, fetchApiToken } from '@/lib/auth/peisschtappernToken'

export async function GET(request: NextRequest) {
    await checkToken()

    const searchParams = request.nextUrl.searchParams
    const apiToken = await fetchApiToken()

    return fetch(
        `${process.env.PEISSCHTAPPERN_API_BASE_URL}/api?${searchParams.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        }
    )
}
