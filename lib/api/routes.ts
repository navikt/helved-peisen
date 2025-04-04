const taskApiBaseUrl = process.env.TASK_API_BASE_URL
const kafkaApiBaseUrl = process.env.PEISSCHTAPPERN_API_BASE_URL

export const Routes = {
    internal: {
        tasks: `/api/tasks`,
        history(id: string): string {
            return `/api/tasks/${id}/history`
        },
        task(id: string): string {
            return `/api/tasks/${id}`
        },
        retry(id: string): string {
            return `/api/tasks/${id}/rerun`
        },
        stop(id: string): string {
            return `/api/tasks/${id}/stop`
        },
        retryAll(): string {
            return '/api/tasks/rerun'
        },
    },
    external: {
        tasks: `${taskApiBaseUrl}/api/tasks`,
        history(id: string): string {
            return `${taskApiBaseUrl}/api/tasks/${id}/history`
        },
        kafka: `${kafkaApiBaseUrl}/api`,
    },
} as const
