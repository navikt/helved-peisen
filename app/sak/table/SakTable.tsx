import React from 'react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { Skeleton } from '@navikt/ds-react'
import { type Message } from '@/app/kafka/types.ts'
import { SakTableRow } from '@/app/sak/table/SakTableRow.tsx'

type Props = {
    messages: Message[]
    activeMessage?: Message | null
}

export const SakTable: React.FC<Props> = ({ messages, activeMessage }) => {
    return (
        <Table className="overflow-scroll" size="small">
            <TableBody>
                {messages.map((message) => (
                    <SakTableRow
                        key={`${message.key}-${message.topic_name}-${message.partition}-${message.offset}`}
                        message={message}
                        active={message === activeMessage}
                    />
                ))}
            </TableBody>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                    <TableHeaderCell textSize="small">Status</TableHeaderCell>
                    <TableHeaderCell textSize="small">Key</TableHeaderCell>
                    <TableHeaderCell textSize="small">Timestamp</TableHeaderCell>
                    <TableHeaderCell textSize="small">Partition</TableHeaderCell>
                    <TableHeaderCell textSize="small">Offset</TableHeaderCell>
                    <TableHeaderCell />
                </TableRow>
            </TableHeader>
        </Table>
    )
}

export const SakTableSkeleton = () => {
    return (
        <Table className="overflow-scroll" size="small">
            <TableBody>
                {new Array(20).fill(null).map((_, i) => (
                    <TableExpandableRow key={i} content={undefined}>
                        <TableDataCell colSpan={7}>
                            <Skeleton height={33} />
                        </TableDataCell>
                    </TableExpandableRow>
                ))}
            </TableBody>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                    <TableHeaderCell textSize="small">Status</TableHeaderCell>
                    <TableHeaderCell textSize="small">Key</TableHeaderCell>
                    <TableHeaderCell textSize="small">Timestamp</TableHeaderCell>
                    <TableHeaderCell textSize="small">Partition</TableHeaderCell>
                    <TableHeaderCell textSize="small">Offset</TableHeaderCell>
                    <TableHeaderCell />
                </TableRow>
            </TableHeader>
        </Table>
    )
}
