'use client'

import { useContext } from 'react'
import { HStack, Pagination, Skeleton, Table, TextField } from '@navikt/ds-react'
import {
    type SortState,
    TableBody,
    TableColumnHeader,
    TableDataCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import type { Message } from '@/app/kafka/types.ts'
import { MessageTableRow } from '@/app/kafka/table/MessageTableRow.tsx'
import { NoMessages } from '../NoMessages'
import { SortStateContext } from './SortState'
import { useFiltere } from '../Filtere'

const getNextDirection = (direction: SortState['direction']): SortState['direction'] => {
    return direction === 'descending' ? 'ascending' : direction === 'ascending' ? 'none' : 'descending'
}

type Props = {
    messages: Message[]
    totalMessages: number
}

const MessagesPagination: React.FC<Props> = ({ messages, totalMessages }) => {
    const { page, pageSize, setFiltere } = useFiltere()

    const start = (page - 1) * pageSize
    const end = start + messages.length

    const onChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = +event.target.value
        if (!isNaN(value) && value > 0) {
            setFiltere({ pageSize: value })
        }
    }

    if (messages.length === 0 || totalMessages === 0) {
        return null
    }

    return (
        <div className="flex items-center justify-between gap-8 py-4 px-0">
            <HStack align="center" gap="space-8">
                <>
                    <Pagination
                        page={page}
                        onPageChange={(page) => setFiltere({ page })}
                        count={Math.ceil(totalMessages / pageSize)}
                        size="xsmall"
                    />
                    Viser meldinger {start + 1} - {end} av {totalMessages}
                </>
            </HStack>
            <HStack align="center" gap="space-12">
                Meldinger pr. side
                <TextField label="Sidestørrelse" hideLabel size="small" value={pageSize} onChange={onChangePageSize} />
            </HStack>
        </div>
    )
}

export const MessagesTable: React.FC<Props> = ({ messages, totalMessages }) => {
    const { setSortState, ...sortState } = useContext(SortStateContext)

    const updateSortState = (key: keyof Message) => {
        setSortState((sort: SortState) => {
            if (sort.orderBy !== key) {
                return { orderBy: key, direction: 'descending' }
            }
            const direction = getNextDirection(sort.direction)
            return { orderBy: direction === 'none' ? '' : key, direction: direction }
        })
    }

    return (
        <>
            <div className="animate-fade-in max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                <MessagesPagination messages={messages} totalMessages={totalMessages} />
                <Table
                    className="h-max overflow-scroll"
                    sort={sortState}
                    onSortChange={updateSortState as (key: string) => void}
                    size="small"
                >
                    <TableBody>
                        {messages.map((message) => (
                            <MessageTableRow
                                key={`${message.key}-${message.topic_name}-${message.partition}-${message.offset}`}
                                message={message}
                            />
                        ))}
                    </TableBody>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell textSize="small" />
                            <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                            <TableHeaderCell textSize="small">Status</TableHeaderCell>
                            <TableHeaderCell textSize="small">Key</TableHeaderCell>
                            <TableColumnHeader
                                sortKey="system_time_ms"
                                sortable
                                textSize="small"
                                className="[&_button]:text-(--ax-text-accent-subtle)"
                            >
                                Timestamp
                            </TableColumnHeader>
                            <TableHeaderCell textSize="small">Partition</TableHeaderCell>
                            <TableColumnHeader
                                sortKey="offset"
                                sortable
                                textSize="small"
                                className="[&_button]:text-(--ax-text-accent-subtle)"
                            >
                                Offset
                            </TableColumnHeader>
                            <TableDataCell></TableDataCell>
                        </TableRow>
                    </TableHeader>
                </Table>
                {messages.length === 0 && <NoMessages />}
                <MessagesPagination messages={messages} totalMessages={totalMessages} />
            </div>
        </>
    )
}

export const MessagesTableSkeleton = () => {
    return (
        <div className="max-w-[100vw] overflow-y-auto scrollbar-gutter-stable" data-testid="messages-table-skeleton">
            <Table className="h-max overflow-scroll" size="small">
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
