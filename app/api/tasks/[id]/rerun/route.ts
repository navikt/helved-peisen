import { NextRequest } from 'next/server'
import { checkToken, fetchApiToken } from '@/lib/auth/token.ts'

export async function PUT(
    _: NextRequest,
    { params }: { params: Promise<{ id: Task['id'] }> }
) {
    await checkToken()

    const apiToken = await fetchApiToken()
    const taskId = (await params).id

    return fetch(`${process.env.TASK_API_BASE_URL}/api/tasks/${taskId}/rerun`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${apiToken}`,
        },
    })
}
