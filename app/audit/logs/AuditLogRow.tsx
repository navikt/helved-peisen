import React from 'react'
import { AuditLogEntry, parseAuditLogPayload } from '@/app/audit/logs/types.ts'
import { JsonView } from '@/components/JsonView.tsx'
import { TableDataCell, TableExpandableRow } from '@navikt/ds-react/Table'
import { format, isValid, parseISO } from 'date-fns'

function formatTimestamp(timestamp: string) {
    const date = parseISO(timestamp)
    return isValid(date) ? format(date, 'yyyy-MM-dd, HH:mm:ss') : timestamp
}
export const AuditLogRow: React.FC<{ entry: AuditLogEntry }> = ({ entry }) => {
    const parsed = parseAuditLogPayload(entry.payload)
    const msg = parsed.message
    const details = msg?.details ?? {}
    const content =
        parsed.json !== null ? (
            <JsonView json={parsed.json} className="max-h-[60vh] overflow-auto" />
        ) : (
            <pre className="whitespace-pre-wrap break-all text-sm">{entry.payload}</pre>
        )

    return (
        <TableExpandableRow content={content}>
            <TableDataCell>
                <span className="whitespace-nowrap">{formatTimestamp(entry.timestamp)}</span>
            </TableDataCell>
            <TableDataCell>
                <span className="whitespace-nowrap" title={msg?.email ?? undefined}>
                    {msg?.name ?? msg?.email ?? '-'}
                </span>
            </TableDataCell>
            <TableDataCell>{msg?.ident ?? '-'}</TableDataCell>
            <TableDataCell>{msg?.action ?? '-'}</TableDataCell>
            <TableDataCell>
                <span className="line-clamp-2" title={msg?.reason ?? undefined}>
                    {msg?.reason ?? '-'}
                </span>
            </TableDataCell>
            <TableDataCell>
                <span className="whitespace-nowrap">{details.key ?? '-'}</span>
            </TableDataCell>
            <TableDataCell>{details.topic ?? '-'}</TableDataCell>
            <TableDataCell>{details.fagsystem ?? '-'}</TableDataCell>
        </TableExpandableRow>
    )
}