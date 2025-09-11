'use client'

import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { HStack, Pagination, Skeleton, SortState as AkselSortState, Table, TextField } from '@navikt/ds-react'
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
import MessageFilter from '@/components/MessageFilter.tsx'

const getNextDirection = (direction: SortState['direction']): SortState['direction'] => {
    return direction === 'descending' ? 'ascending' : direction === 'ascending' ? 'none' : 'descending'
}

export type MessageFilters = {
    visning: 'alle' | 'siste'
    utbetalingManglerKvittering: boolean
}

const useDefaultSortState = (): SortState => {
    return useSearchParams().get('topics')
        ? { orderBy: 'offset', direction: 'descending' }
        : { orderBy: 'timestamp_ms', direction: 'descending' }
}

const latestMessages = (messages: Message[]) => {
    const grouped = new Map<string, Message>()
    messages.forEach((message) => {
        const key = `${message.topic_name}:${message.key}`
        const existing = grouped.get(key)
        if (!existing || message.timestamp_ms > existing.timestamp_ms) {
            grouped.set(key, message)
        }
    })
    return Array.from(grouped.values())
}

const useSortedAndFilteredMessages = (messages: Message[], filter: MessageFilters, sortState?: SortState) => {
    return useMemo(() => {
        let filtered = filter.visning === 'siste' ? latestMessages(messages) : messages

        if (filter.utbetalingManglerKvittering) {
            filtered = filtered.filter(
                (m) =>
                    m.topic_name === 'helved.oppdrag.v1' &&
                    !messages.some((kv) => kv.topic_name === 'helved.kvittering.v1' && kv.key === m.key)
            )
        }

        return filtered
            .slice(0) // unngå in-place sort på memoisert array
            .sort((a, b) =>
                sortState
                    ? sortState.direction === 'ascending'
                        ? +a[sortState.orderBy]! - +b[sortState.orderBy]!
                        : +b[sortState.orderBy]! - +a[sortState.orderBy]!
                    : 0
            )
    }, [messages, filter, sortState])
}

type SortState = Omit<AkselSortState, 'orderBy'> & {
    orderBy: keyof Message
}

type Props = {
    messages: Record<string, Message[]>
}

export const MessagesTable: React.FC<Props> = ({ messages }) => {
    const [sortState, setSortState] = useState<SortState | undefined>(useDefaultSortState())
    const [filters, setFilters] = useState<MessageFilters>({
        visning: 'alle',
        utbetalingManglerKvittering: false,
    })

    const allMessages = useMemo(() => Object.values(messages).flat(), [messages])
    const sortedMessages = useSortedAndFilteredMessages(allMessages, filters, sortState)

    const updateSortState = (key: keyof Message) => {
        setSortState((sort) => {
            if (!sort || sort.orderBy !== key) {
                return { orderBy: key, direction: 'descending' }
            }
            const direction = getNextDirection(sort.direction)
            return direction === 'none' ? undefined : { orderBy: key, direction: direction }
        })
    }

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(100)

    const onChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = +event.target.value
        if (!isNaN(value) && value > 0) {
            setPageSize(value)
        }
    }

    const handleFilterChange = (filter: MessageFilters) => {
        setFilters(filter)
        setPage(1)
    }

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, sortedMessages.length)
    const paginatedMessages = sortedMessages.slice(start, end)

    return (
        <>
            <div className={clsx(styles.tableContainer, fadeIn.animation)}>
                <HStack align="center" justify="end">
                    <MessageFilter filters={filters} onFiltersChange={handleFilterChange} />
                </HStack>
                <Table
                    className={styles.table}
                    sort={sortState}
                    onSortChange={updateSortState as (key: string) => void}
                    size="small"
                >
                    <TableBody>
                        {paginatedMessages.map((message, i) => (
                            <MessageTableRow key={i} message={message} />
                        ))}
                    </TableBody>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell textSize="small" />
                            <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                            <TableHeaderCell textSize="small">Key</TableHeaderCell>
                            <TableColumnHeader
                                sortKey="timestamp_ms"
                                sortable
                                textSize="small"
                                className={styles.header}
                            >
                                Timestamp
                            </TableColumnHeader>
                            <TableHeaderCell textSize="small">Partition</TableHeaderCell>
                            <TableColumnHeader sortKey="offset" sortable textSize="small" className={styles.header}>
                                Offset
                            </TableColumnHeader>
                            <TableDataCell></TableDataCell>
                        </TableRow>
                    </TableHeader>
                </Table>
                <div className={styles.pagination}>
                    <HStack align="center" gap="space-8">
                        <Pagination
                            page={page}
                            onPageChange={setPage}
                            count={Math.ceil(sortedMessages.length / pageSize)}
                            size="xsmall"
                        />
                        Viser meldinger {start + 1} - {end} av {sortedMessages.length}
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
        </>
    )
}

export const MessagesTableSkeleton = () => {
    return (
        <div className={styles.container}>
            <Table className={styles.table} size="small">
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
