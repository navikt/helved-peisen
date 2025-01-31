import { randomUUID } from 'node:crypto'
import { addDays, subDays } from 'date-fns'

function randomDate(dayRange: number) {
    const today = new Date();
    const startDate = subDays(today, dayRange);
    const endDate = addDays(today, dayRange);

    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    return new Date(randomTime);
}

export const TestData = {
    taskStatus(): TaskStatus {
        const random = Math.random()
        switch (true) {
            case random < 0.75:
                return 'COMPLETE'
            case random < 0.95:
                return 'IN_PROGRESS'
            case random < 0.99:
                return 'FAIL'
            default:
                return 'MANUAL'
        }
    },
    taskKind(): TaskKind {
        const random = Math.random()
        switch (true) {
            case random < 0.1:
                return 'Avstemming'
            case random < 0.55:
                return 'Iverksetting'
            default:
                return 'SjekkStatus'
        }
    },
    task(
        status: TaskStatus = TestData.taskStatus(),
        kind: TaskKind = TestData.taskKind()
    ): Task {
        return {
            id: randomUUID(),
            payload: '',
            status: status,
            attempt: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            scheduledFor: randomDate(10).toISOString(),
            kind: kind,
            metadata: {
                sakId: randomUUID(),
                behandlingId: randomUUID(),
                iverksettingId: randomUUID(),
            },
        }
    },
    tasks(n: number): Task[] {
        return new Array(n).fill(null).map((_) => TestData.task())
    },
    taskHistory(taskId: string): TaskHistory[] {
        return [
            {
                id: randomUUID(),
                taskId: taskId,
                createdAt: new Date().toISOString(),
                triggeredAt: new Date().toISOString(),
                triggeredBy: new Date().toISOString(),
                status: 'COMPLETE',
            },
            {
                id: randomUUID(),
                taskId: taskId,
                createdAt: new Date().toISOString(),
                triggeredAt: new Date().toISOString(),
                triggeredBy: new Date().toISOString(),
                status: 'IN_PROGRESS',
            },
        ]
    },
}
