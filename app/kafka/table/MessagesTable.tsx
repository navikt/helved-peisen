import { Skeleton, Table } from '@navikt/ds-react'
import {
    TableBody,
    TableDataCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import type { Message } from '@/app/kafka/types'
import { MessageTableRow } from '@/app/kafka/table/MessageTableRow.tsx'

import styles from './MessagesTable.module.css'

type Props = {
    messages: Record<string, Message[]>
}

export const MessagesTable: React.FC<Props> = ({ messages }) => {
    const sortedMessages = Object.entries(messages)
        .map(([topic, messages]) => messages.map((it) => ({ ...it, topic })))
        .flat()
        .sort(
            (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
        )

    return (
        <div className={styles.container}>
            <Table className={styles.table}>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Topic</TableHeaderCell>
                        <TableHeaderCell>Key</TableHeaderCell>
                        <TableHeaderCell>Timestamp</TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedMessages.map((message, i) => (
                        <MessageTableRow key={i} message={message} />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export const MessagesTableSkeleton = () => {
    return (
        <div className={styles.container}>
            <Table className={styles.table}>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Key</TableHeaderCell>
                        <TableHeaderCell>Timestamp</TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array(20)
                        .fill(null)
                        .map((_, i) => (
                            <TableRow key={i}>
                                <TableDataCell colSpan={3}>
                                    <Skeleton height={33} />
                                </TableDataCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    )
}
