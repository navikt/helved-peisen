import { HStack, Skeleton, Spacer, Table } from '@navikt/ds-react'
import clsx from 'clsx'
import {
    TableBody,
    TableDataCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { formatDate } from '@/lib/date'
import { useStatusFilter } from '@/lib/hooks/useStatusFilter.ts'
import { StatusBadge } from '@/components/StatusBadge'
import { TaskTableRow } from '@/components/taskTable/TaskTableRow'
import { RetryTaskButton } from '@/components/RetryTaskButton'
import { ErrorTableRow } from '@/components/taskTable/ErrorTableRow'
import { RetryMultipleTasksButton } from '@/components/RetryMultipleTasksButton.tsx'

import styles from './TaskTable.module.css'

const isRetryable = (status: TaskStatus) => {
    // Tillatt rekjøring av alle tasks i dev
    if (window.location.host.includes("dev") || window.location.host.includes("localhost")) {
        return true
    }
    switch (status) {
        case 'IN_PROGRESS':
        case 'FAIL':
            return true
        default:
            return false
    }
}

type Props = React.HTMLAttributes<HTMLDivElement> & {
    tasks: ParseResult<Task>[]
    totalTasks: number
}

export const TaskTable: React.FC<Props> = ({
    tasks,
    totalTasks,
    className,
    ...rest
}) => {
    const parsedTasks = tasks.filter((task) => task.success)
    const parsedErrors = tasks.filter((task) => !task.success)

    const statusFilter = useStatusFilter()

    return (
        <div className={clsx(className, styles.tableContainer)} {...rest}>
            <Table className={styles.table}>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Type</TableHeaderCell>
                        <TableHeaderCell>Sist kjørt</TableHeaderCell>
                        <TableHeaderCell>Neste forsøk</TableHeaderCell>
                        <TableHeaderCell>Forsøk</TableHeaderCell>
                        <TableHeaderCell>Melding</TableHeaderCell>
                        <TableHeaderCell>
                            <HStack>
                                <Spacer />
                                {statusFilter?.every(isRetryable) && (
                                    <RetryMultipleTasksButton
                                        numberOfTasks={totalTasks}
                                    />
                                )}
                            </HStack>
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {parsedErrors.map((error, i) => (
                        <ErrorTableRow key={i} error={error} />
                    ))}
                    {parsedTasks
                        .slice(0)
                        .sort(
                            (a, b) =>
                                new Date(b.data.updatedAt).getTime() -
                                new Date(a.data.updatedAt).getTime()
                        )
                        .map(({ data }) => (
                            <TaskTableRow key={data.id} task={data}>
                                <TableDataCell>
                                    <StatusBadge status={data.status} />
                                </TableDataCell>
                                <TableDataCell>{data.kind}</TableDataCell>
                                <TableDataCell>
                                    {formatDate(data.updatedAt)}
                                </TableDataCell>
                                <TableDataCell>
                                    {isRetryable(data.status)
                                        ? formatDate(data.scheduledFor)
                                        : '-'}
                                </TableDataCell>
                                <TableDataCell>{data.attempt}</TableDataCell>
                                <TableDataCell>{data.message}</TableDataCell>
                                <TableDataCell>
                                    <HStack>
                                        <Spacer />
                                        {isRetryable(data.status) && (
                                            <RetryTaskButton task={data} />
                                        )}
                                    </HStack>
                                </TableDataCell>
                            </TaskTableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}

export const TaskTableSkeleton: React.FC<
    Omit<Props, 'tasks' | 'totalTasks'>
> = ({ className, ...rest }) => {
    return (
        <div className={clsx(className, styles.tableContainer)} {...rest}>
            <Table className={styles.table}>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Type</TableHeaderCell>
                        <TableHeaderCell>Kjøretid</TableHeaderCell>
                        <TableHeaderCell>Forsøk</TableHeaderCell>
                        <TableHeaderCell>Melding</TableHeaderCell>
                        <TableHeaderCell />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array(20)
                        .fill(null)
                        .map((_, i) => (
                            <TableRow key={i}>
                                <TableDataCell colSpan={7}>
                                    <Skeleton height={33} />
                                </TableDataCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}
