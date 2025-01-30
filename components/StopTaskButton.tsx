'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'
import { Routes } from '@/lib/api/routes.ts'

const stopTask = async (task: Task) => {
    const response = await fetch(Routes.internal.stop(task.id), {
        method: 'PUT',
    })

    if (!response.ok) {
        logger.error(`Klarte ikke stoppe task:`, response)
    }
}

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    task: Task
}

export const StopTaskButton: React.FC<Props> = ({ task, ...rest }) => {
    const router = useRouter()

    const onClick = async () => {
        await stopTask(task)
        router.refresh()
    }

    return (
        <Button variant="danger" size="small" onClick={onClick} {...rest}>
            Stop
        </Button>
    )
}
