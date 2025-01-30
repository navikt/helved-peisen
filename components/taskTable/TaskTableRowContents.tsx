'use client'

import { Fragment } from 'react'
import { Alert } from '@navikt/ds-react'
import { StatusBadge } from '@/components/StatusBadge'
import { Metadata } from '@/components/Metadata'
import { formatDate } from '@/lib/date'

import styles from './TaskTableRowContents.module.css'

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

export const TaskTableRowContents: React.FC<Props> = ({ task, history }) => (
    <div className={styles.content}>
        <Metadata metadata={task.metadata} />
        <TaskHistoryView task={task} history={history} />
    </div>
)
