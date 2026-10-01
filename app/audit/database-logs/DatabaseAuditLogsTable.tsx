'use client'

import { useState } from 'react'
import { format, isValid, parseISO, subDays } from 'date-fns'
import { Alert, Table, Tag } from '@navikt/ds-react'
import {
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import { DatabaseAuditLogsPagination } from '@/app/audit/database-logs/DatabaseAuditLogsPagination.tsx'
import { parseDatabaseAuditLog } from '@/app/audit/database-logs/types.ts'
import { useDatabaseAuditLogs } from '@/app/audit/database-logs/useDatabaseAuditLogs.ts'
import { AuditLogsSkeleton } from '@/app/audit/logs/AuditLogsSkeleton.tsx'
import { DateRangeSelect } from '@/components/DateRangeSelect.tsx'
import { JsonView } from '@/components/JsonView.tsx'
import { NoMessages } from '@/components/NoMessages.tsx'

const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp)
    return isValid(date) ? format(date, 'yyyy-MM-dd, HH:mm:ss') : timestamp
}

const DatabaseAuditLogRow = ({ entry }: { entry: Parameters<typeof parseDatabaseAuditLog>[0] }) => {
    const log = parseDatabaseAuditLog(entry)

    return (
        <TableExpandableRow content={<JsonView json={log.json} className="max-h-[60vh] overflow-auto" />}>
            <TableDataCell>
                <Tag variant="neutral" size="small">
                    {log.severity}
                </Tag>
            </TableDataCell>
            <TableDataCell>{log.command}</TableDataCell>
            <TableDataCell>{log.database}</TableDataCell>
            <TableDataCell>{log.user}</TableDataCell>
            <TableDataCell>
                <span className="whitespace-nowrap">{log.timestamp ? formatTimestamp(log.timestamp) : '-'}</span>
            </TableDataCell>
        </TableExpandableRow>
    )
}

export const DatabaseAuditLogsTable = () => {
    const [fom, setFom] = useState(() => subDays(new Date(), 30).toISOString())
    const [tom, setTom] = useState('now')
    const [pageSize, setPageSize] = useState(100)
    const { entries, page, pageCount, loading, error, changePage } = useDatabaseAuditLogs({ fom, tom, pageSize })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex">
                <DateRangeSelect from={fom} to={tom} updateFrom={setFom} updateTo={setTom} />
            </div>

            {loading ? (
                <AuditLogsSkeleton />
            ) : error ? (
                <Alert variant="error" role="alert">
                    {error}
                </Alert>
            ) : entries.length === 0 ? (
                <NoMessages title="Fant ingen database-logger" />
            ) : (
                <>
                    <div className="animate-fade-in max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                        <Table className="h-max" size="small">
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell textSize="small" />
                                    <TableHeaderCell textSize="small">Status</TableHeaderCell>
                                    <TableHeaderCell textSize="small">Kommando</TableHeaderCell>
                                    <TableHeaderCell textSize="small">Database</TableHeaderCell>
                                    <TableHeaderCell textSize="small">Utført av</TableHeaderCell>
                                    <TableHeaderCell textSize="small">Tidspunkt</TableHeaderCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {entries.map((entry, index) => (
                                    <DatabaseAuditLogRow
                                        key={`${entry.insertId ?? entry.timestamp ?? index}`}
                                        entry={entry}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DatabaseAuditLogsPagination
                        entryCount={entries.length}
                        page={page}
                        pageCount={pageCount}
                        pageSize={pageSize}
                        onPageChange={(nextPage) => void changePage(nextPage)}
                        onPageSizeChange={setPageSize}
                    />
                </>
            )}
        </div>
    )
}
