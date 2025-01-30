import { NextRequest } from 'next/server'
import { checkToken, fetchApiToken } from '@/lib/auth/token.ts'

export async function PUT(
    _: NextRequest,
    { params }: { params: { id: Task['id'] } }
) {
    await checkToken()

    const apiToken = await fetchApiToken()
    const taskId = params.id

    return fetch(`${process.env.TASK_API_BASE_URL}/api/tasks/${taskId}/stop`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    })
}
