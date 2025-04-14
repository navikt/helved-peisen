import { Routes } from '@/lib/api/routes.ts'
import { logger } from '@navikt/next-logger'
import { Button } from '@navikt/ds-react'
import {
    ReadonlyURLSearchParams,
    useRouter,
    useSearchParams,
} from 'next/navigation'

const retryTasks = async (searchParams: ReadonlyURLSearchParams) => {
    const url = `${Routes.internal.retryAll()}?${searchParams.toString()}`
    const response = await fetch(url, { method: 'PUT' })

    if (!response.ok) {
        logger.error('Klarte ikke rekjøre task:', response)
    }
}

type Props = {
    numberOfTasks: number
}

export const RetryMultipleTasksButton: React.FC<Props> = ({
    numberOfTasks,
}) => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const onClick = async () => {
        await retryTasks(searchParams)
        router.refresh()
    }

    return (
        <Button size="small" onClick={onClick}>
            Rekjør alle ({numberOfTasks})
        </Button>
    )
}
