'use client'

import { HStack, Pagination, Skeleton, Table, TextField } from '@navikt/ds-react'
import { TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'

import { NoMessages } from '@/components/NoMessages.tsx'
import type { Message } from '@/app/kafka/types.ts'
import { AuditTableRow } from '@/app/audit/table/AuditTableRow.tsx'
import { useAuditFiltere } from '@/app/audit/AuditFiltereContext.tsx'

type Props = {
    messages: Message[]
    totalMessages: number
}

const AuditPagination: React.FC<Props> = ({ messages, totalMessages }) => {
    const { page, pageSize, setFiltere } = useAuditFiltere()

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

export const AuditTable: React.FC<Props> = ({ messages, totalMessages }) => {
    return (
        <>
            <div className="animate-fade-in max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                <Table className="h-max overflow-scroll" size="small">
                    <TableBody>
                        {messages.map((message, i) => (
                            <AuditTableRow
                                key={`${message.key}-${message.topic_name}-${message.partition}-${message.offset}-${i}`}
                                message={message}
                            />
                        ))}
                    </TableBody>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell textSize="small" />
                            <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                            <TableHeaderCell textSize="small">Key</TableHeaderCell>
                            <TableHeaderCell textSize="small">Endring</TableHeaderCell>
                            <TableHeaderCell textSize="small">Endret av</TableHeaderCell>
                            <TableHeaderCell textSize="small">Årsak</TableHeaderCell>
                            <TableHeaderCell textSize="small">Tidspunkt</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                </Table>
                {messages.length === 0 && <NoMessages title="Fant ingen manuelt endrede meldinger" />}
            </div>
            <AuditPagination messages={messages} totalMessages={totalMessages} />
        </>
    )
}

export const AuditTableSkeleton = () => {
    return (
        <div className="max-w-[100vw] overflow-y-auto scrollbar-gutter-stable" data-testid="audit-table-skeleton">
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
