'use client'

import { useState } from 'react'
import { Skeleton, SortState, Table } from '@navikt/ds-react'
import {
    TableBody,
    TableColumnHeader,
    TableDataCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import type { Message } from '@/app/kafka/types.ts'
import { MessageTableRow } from '@/app/kafka/table/MessageTableRow.tsx'

import styles from './MessagesTable.module.css'

const getNextDirection = (
    direction: SortState['direction']
): SortState['direction'] => {
    return direction === 'descending'
        ? 'ascending'
        : direction === 'ascending'
          ? 'none'
          : 'descending'
}

type Props = {
    messages: Record<string, Message[]>
}

export const MessagesTable: React.FC<Props> = ({ messages }) => {
    const [sortState, setSortState] = useState<SortState | undefined>({
        orderBy: 'timestamp_ms',
        direction: 'descending',
    })

    const sortedMessages = Object.values(messages)
        .flat()
        .sort((a, b) =>
            sortState
                ? sortState.direction === 'ascending'
                    ? // @ts-ignore TODO
                      +a[sortState.orderBy] - +b[sortState.orderBy]
                    : // @ts-ignore TODO
                      +b[sortState.orderBy] - +a[sortState.orderBy]
                : 0
        )

    const updateSortState = (key: string) => {
        setSortState((sort) => {
            if (!sort || sort.orderBy !== key) {
                return { orderBy: key, direction: 'descending' }
            }

            const direction = getNextDirection(sort.direction)

            return direction === 'none'
                ? undefined
                : {
                      orderBy: key,
                      direction: direction,
                  }
        })
    }

    return (
        <div className={styles.container}>
            <Table
                className={styles.table}
                sort={sortState}
                onSortChange={updateSortState}
            >
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Topic</TableHeaderCell>
                        <TableHeaderCell>Key</TableHeaderCell>
                        <TableColumnHeader sortKey="timestamp_ms" sortable>
                            Timestamp
                        </TableColumnHeader>
                        <TableHeaderCell>Partition</TableHeaderCell>
                        <TableColumnHeader sortKey="offset" sortable>
                            Offset
                        </TableColumnHeader>
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
                        <TableHeaderCell>Topic</TableHeaderCell>
                        <TableHeaderCell>Key</TableHeaderCell>
                        <TableHeaderCell>Timestamp</TableHeaderCell>
                        <TableHeaderCell>Partition</TableHeaderCell>
                        <TableHeaderCell>Offset</TableHeaderCell>
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
