'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
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

import fadeIn from '@/styles/fadeIn.module.css'
import styles from './MessagesTable.module.css'
import { MessagesProvider } from '@/app/kafka/table/MessagesContext.tsx'
import { useSearchParams } from 'next/navigation'

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
    const searchParams = useSearchParams()
    const [sortState, setSortState] = useState<SortState | undefined>({
        orderBy: 'timestamp_ms',
        direction: 'descending',
    })

    useEffect(() => {
        const topicsParam = searchParams.get('topics')
        if (topicsParam) {
            setSortState({
                orderBy: 'offset',
                direction: 'descending',
            })
        } else {
            setSortState({
                orderBy: 'timestamp_ms',
                direction: 'descending',
            })
        }
    }, [searchParams])

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
        <MessagesProvider messages={sortedMessages}>
            <div className={clsx(styles.container, fadeIn.animation)}>
                <Table
                    className={styles.table}
                    sort={sortState}
                    onSortChange={updateSortState}
                >
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell textSize="small" />
                            <TableHeaderCell textSize="small">
                                Topic
                            </TableHeaderCell>
                            <TableHeaderCell textSize="small">
                                Key
                            </TableHeaderCell>
                            <TableColumnHeader
                                sortKey="timestamp_ms"
                                sortable
                                textSize="small"
                                className={styles.header}
                            >
                                Timestamp
                            </TableColumnHeader>
                            <TableHeaderCell textSize="small">
                                Partition
                            </TableHeaderCell>
                            <TableColumnHeader
                                sortKey="offset"
                                sortable
                                textSize="small"
                                className={styles.header}
                            >
                                Offset
                            </TableColumnHeader>
                            <TableDataCell></TableDataCell>
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
        </MessagesProvider>
    )
}

export const MessagesTableSkeleton = () => {
    return (
        <>
            <div className={styles.container}>
                <Table className={styles.table}>
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
