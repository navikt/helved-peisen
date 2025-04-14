'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'
import { Routes } from '@/lib/api/routes.ts'

const retryTask = async (task: Task) => {
    const response = await fetch(Routes.internal.retry(task.id), {
        method: 'PUT',
    })

    if (!response.ok) {
        logger.error(`Klarte ikke rekjøre task:`, response)
    }
}

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    task: Task
}

export const RetryTaskButton: React.FC<Props> = ({ task, ...rest }) => {
    const router = useRouter()

    const onClick = async () => {
        await retryTask(task)
        router.refresh()
    }

    return (
        <Button variant="primary" size="small" onClick={onClick} {...rest}>
            Rekjør
        </Button>
    )
}
