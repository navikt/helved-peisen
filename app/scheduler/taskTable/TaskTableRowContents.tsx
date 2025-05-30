'use client'

import React, { Fragment } from 'react'
import { Alert } from '@navikt/ds-react'

import { StatusBadge } from '@/components/StatusBadge.tsx'
import { JsonView } from '@/components/JsonView.tsx'
import { formatDate } from '@/lib/date.ts'

import styles from './TaskTableRowContents.module.css'

type PayloadProps = {
    payload: string
}

export const Payload: React.FC<PayloadProps> = ({ payload }) => {
    const json = (() => {
        try {
            return JSON.parse(payload)
        } catch (e) {
            console.error(e)
            return null
        }
    })()

    if (!json) {
        return null
    }

    return <JsonView className={styles.json} json={json} />
}

type TaskHistoryViewProps = {
    task: Task
    history: ApiResponse<TaskHistory[]>
}

const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({ task, history }) => {
    if (history.error) {
        return (
            <Alert variant="error">
                Klarte ikke hente hente historikk for task:{' '}
                {history.error.statusCode} - {history.error.message}
            </Alert>
        )
    }

    if (!history.data || history.data.length === 0) {
        return null
    }

    return (
        <div className={styles.grid}>
            <StatusBadge status={task.status} />
            <span>Utført: {formatDate(task.updatedAt)}</span>
            <span>{task.message}</span>
            {history.data
                ?.slice(0)
                .sort(
                    (a, b) =>
                        new Date(b.triggeredAt).getTime() -
                        new Date(a.triggeredAt).getTime()
                )
                .map((history) => (
                    <Fragment key={history.id}>
                        <StatusBadge status={history.status} />
                        <span>Utført: {formatDate(history.triggeredAt)}</span>
                        <span>{history.message}</span>
                    </Fragment>
                ))}
        </div>
    )
}

type Props = {
    task: Task
    history: ApiResponse<TaskHistory[]>
}

export const TaskTableRowContents: React.FC<Props> = ({ task, history }) => {
    return (
        <div className={styles.content}>
            <Payload payload={task.payload} />
            <TaskHistoryView task={task} history={history} />
        </div>
    )
}
