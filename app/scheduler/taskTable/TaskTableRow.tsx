'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { ExpandableRowProps } from '@navikt/ds-react'
import { TableExpandableRow } from '@navikt/ds-react/Table'
import { TaskTableRowContents } from '@/app/scheduler/taskTable/TaskTableRowContents.tsx'
import { fetchHistory, FetchHistoryResponse } from '@/lib/api/history.ts'

import styles from './TaskTableRow.module.css'

type Props = Omit<ExpandableRowProps, 'content'> & {
    task: Task
}

export const TaskTableRow: React.FC<Props> = ({
    task,
    children,
    className,
    ...rest
}) => {
    const [isFetching, setIsFetching] = useState(false)
    const [history, setHistory] = useState<FetchHistoryResponse | null>(null)
    const [open, setOpen] = useState(false)

    const onOpenChange = async (open: boolean) => {
        if (open) {
            setIsFetching(true)
            const response = await fetchHistory(task.id)
            setHistory(response)
            setIsFetching(false)
        }
        setOpen(open)
    }

    return (
        <TableExpandableRow
            className={clsx(
                className,
                styles.row,
                isFetching && styles.fetching
            )}
            open={!!history && open}
            onOpenChange={onOpenChange}
            {...rest}
            content={
                history && (
                    <TaskTableRowContents task={task} history={history} />
                )
            }
        >
            {children}
        </TableExpandableRow>
    )
}
