'use client'

import { useState } from 'react'
import {
    HStack,
    Pagination,
    Skeleton,
    SortState,
    Table,
    TextField,
} from '@navikt/ds-react'
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

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    const onChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = +event.target.value
        if (!isNaN(value) && value > 0) {
            setPageSize(value)
        }
    }

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, sortedMessages.length)
    const paginatedMessages = sortedMessages.slice(start, end)

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
                    {paginatedMessages.map((message, i) => (
                        <MessageTableRow key={i} message={message} />
                    ))}
                </TableBody>
            </Table>
            <div className={styles.pagination}>
                <HStack align="center" gap="space-8">
                    <Pagination
                        page={page}
                        onPageChange={setPage}
                        count={Math.ceil(sortedMessages.length / pageSize)}
                        size="xsmall"
                    />
                    Viser meldinger {start + 1} - {end} av{' '}
                    {sortedMessages.length}
                </HStack>
                <HStack align="center" gap="space-12">
                    Meldinger pr. side
                    <TextField
                        label="Sidestørrelse"
                        hideLabel
                        size="small"
                        value={pageSize}
                        onChange={onChangePageSize}
                    />
                </HStack>
            </div>
        </div>
    )
}

export const MessagesTableSkeleton = () => {
    return (
        <>
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
        </>
    )
}
