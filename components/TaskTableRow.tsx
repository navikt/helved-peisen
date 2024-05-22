'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@navikt/ds-react'
import { TableDataCell, TableExpandableRow } from '@navikt/ds-react/Table'
import { StatusBadge } from '@/components/StatusBadge'
import { UrlSearchParamLink } from '@/components/UrlSearchParamLink'
import { TaskTableRowContents } from '@/components/TaskTableRowContents'

import styles from './TaskTableRow.module.css'
import { getLogs } from '@/lib/api/logs'

async function rekjør(taskId: number) {
    return fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
    })
}

type Props = {
    task: Task
}

export function TaskTableRow({ task }: Props) {
    const router = useRouter()
    const didOpen = useRef(false)
    const [open, setOpen] = useState(false)
    const [logs, setLogs] = useState([])

    const onOpenChange = (open: boolean) => {
        setOpen(open)
    }

    useEffect(() => {
        if (open && !didOpen.current) {
            didOpen.current = true
            getLogs(task.id).then(({ logs }) => setLogs(logs))
        }
    }, [open, task, didOpen])

    const onRekjørTask = async (taskId: number) => {
        const response = await rekjør(taskId)

        if (response.ok) {
            router.refresh()
        }
    }

    return (
        <TableExpandableRow
            className={styles.row}
            expandOnRowClick
            open={open && logs.length > 0}
            onOpenChange={onOpenChange}
            content={
                <>
                    <TaskTableRowContents logs={logs} />
                </>
            }
            togglePlacement="right"
        >
            <TableDataCell>
                <StatusBadge status={task.status} />
            </TableDataCell>
            <TableDataCell>{task.id}</TableDataCell>
            <TableDataCell>
                <UrlSearchParamLink
                    searchParamName="type"
                    searchParamValue={task.type}
                >
                    {task.type}
                </UrlSearchParamLink>
            </TableDataCell>
            <TableDataCell>
                <UrlSearchParamLink
                    searchParamName="callId"
                    searchParamValue={task.metadata.callId}
                >
                    {task.metadata.callId}
                </UrlSearchParamLink>
            </TableDataCell>
            <TableDataCell>
                {new Date(task.sistKjørt).toLocaleString('no-NB')}
            </TableDataCell>
            <TableDataCell>{task.antallLogger}</TableDataCell>
            <TableDataCell>
                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => onRekjørTask(task.id)}
                >
                    Rekjør
                </Button>
            </TableDataCell>
        </TableExpandableRow>
    )
}
