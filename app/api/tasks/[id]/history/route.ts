import { NextRequest } from 'next/server'
import { checkToken, getApiToken } from '@/lib/auth/token'

export async function GET(
    _: NextRequest,
    { params }: { params: { id: Task['id'] } }
) {
    await checkToken()

    const apiToken = await getApiToken()

    return fetch(
        `${process.env.TASK_API_BASE_URL}/api/tasks/${params.id}/history`,
        {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        }
    )
}
