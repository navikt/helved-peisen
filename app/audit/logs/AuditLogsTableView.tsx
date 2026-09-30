'use client'

import { Table } from '@navikt/ds-react'
import { TableBody, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'

import type { AuditLogEntry } from '@/app/audit/logs/types.ts'
import { AuditLogRow } from '@/app/audit/logs/AuditLogRow.tsx'
import { AuditLogsPagination } from '@/app/audit/logs/AuditLogsPagination.tsx'

type Props = {
    entries: AuditLogEntry[]
    page: number
    pageCount: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export const AuditLogsTableView = ({ entries, page, pageCount, pageSize, onPageChange, onPageSizeChange }: Props) => {
    const paginationProps = { entries, page, pageCount, pageSize, onPageChange, onPageSizeChange }

    return (
        <>
            <AuditLogsPagination {...paginationProps} />
            <div className="animate-fade-in max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                <Table className="h-max" size="small">
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell textSize="small" />
                            <TableHeaderCell textSize="small">Tidspunkt</TableHeaderCell>
                            <TableHeaderCell textSize="small">Navn</TableHeaderCell>
                            <TableHeaderCell textSize="small">Ident</TableHeaderCell>
                            <TableHeaderCell textSize="small">Handling</TableHeaderCell>
                            <TableHeaderCell textSize="small">Årsak</TableHeaderCell>
                            <TableHeaderCell textSize="small">Key</TableHeaderCell>
                            <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                            <TableHeaderCell textSize="small">Fagsystem</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry, i) => (
                            <AuditLogRow key={`${entry.timestamp}-${i}`} entry={entry} />
                        ))}
                    </TableBody>
                </Table>
            </div>
            <AuditLogsPagination {...paginationProps} />
        </>
    )
}
