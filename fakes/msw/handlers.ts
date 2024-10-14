import { http, HttpResponse } from 'msw'
import { Routes } from '@/lib/api/routes.ts'

export const taskErrorResponse = () => {
    return http.get(
        Routes.internal.tasks,
        () => {
            return new HttpResponse(null, { status: 500 })
        },
        { once: true }
    )
}

export const emptyTaskResponse = () => {
    return http.get(
        Routes.internal.tasks,
        () => {
            const emptyResponse = {
                tasks: [],
                page: 1,
                pageSize: 0,
                totalTasks: 0,
            }

            return new HttpResponse(JSON.stringify(emptyResponse), {
                status: 200,
            })
        },
        { once: true }
    )
}
