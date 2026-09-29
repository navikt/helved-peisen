'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { format, isValid, parseISO, subDays } from 'date-fns'
import { Alert, BodyShort, Button, HStack, Skeleton, Table, Tag } from '@navikt/ds-react'
import {
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import type { ApiResponse } from '@/lib/api/types.ts'
import { NoMessages } from '@/components/NoMessages.tsx'
import { JsonView } from '@/components/JsonView.tsx'
import { DateRangeSelect } from '@/components/DateRangeSelect.tsx'
import { type AuditLogEntry, type AuditLogPage, parseAuditLogPayload } from '@/app/audit/logs/types.ts'

const PAGE_SIZE = 100

function timeFilter(fom: string, tom: string) {
    const to = tom === 'now' ? new Date().toISOString() : tom
    return `timestamp>="${fom}" AND timestamp<="${to}"`
}

function formatTimestamp(timestamp: string) {
    const date = parseISO(timestamp)
    return isValid(date) ? format(date, 'yyyy-MM-dd, HH:mm:ss') : timestamp
}

function severityVariant(severity: string): React.ComponentProps<typeof Tag>['variant'] {
    switch (severity) {
        case 'ERROR':
        case 'CRITICAL':
        case 'ALERT':
        case 'EMERGENCY':
            return 'error'
        case 'WARNING':
            return 'warning'
        case 'NOTICE':
        case 'INFO':
            return 'info'
        default:
            return 'neutral'
    }
}

const AuditLogRow: React.FC<{ entry: AuditLogEntry }> = ({ entry }) => {
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
                <Tag size="xsmall" variant={severityVariant(entry.severity)}>
                    {entry.severity}
                </Tag>
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

const AuditLogsSkeleton = () => (
    <div data-testid="audit-logs-skeleton">
        {Array(10)
            .fill(null)
            .map((_, i) => (
                <Skeleton key={i} height={33} />
            ))}
    </div>
)

async function fetchAuditLogs(
    filter: string,
    pageToken: string | null,
    signal?: AbortSignal
): Promise<ApiResponse<AuditLogPage>> {
    const params = new URLSearchParams({ pageSize: String(PAGE_SIZE) })
    if (filter) params.set('filter', filter)
    if (pageToken) params.set('pageToken', pageToken)

    const response = await fetch(`/api/audit-logs?${params.toString()}`, { signal })
    return (await response.json()) as ApiResponse<AuditLogPage>
}

export const AuditLogsTable: React.FC = () => {
    const isDev = process.env.NODE_ENV !== 'production'
    const [fom, setFom] = useState(() => subDays(new Date(), 7).toISOString())
    const [tom, setTom] = useState('now')
    const [entries, setEntries] = useState<AuditLogEntry[]>([])
    const [nextPageToken, setNextPageToken] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const activeFilter = useRef('')

    const load = useCallback(async (pageToken: string | null, signal?: AbortSignal) => {
        try {
            const res = await fetchAuditLogs(activeFilter.current, pageToken, signal)
            if (signal?.aborted) return

            if (res.error !== null) {
                setError(res.error)
                return
            }

            setError(null)
            setEntries((prev) => (pageToken ? [...prev, ...res.data.entries] : res.data.entries))
            setNextPageToken(res.data.nextPageToken)
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') return
            setError('Uventet feil ved henting av audit-logger')
        }
    }, [])

    useEffect(() => {
        if (isDev) return

        const controller = new AbortController()
        setLoading(true)
        setEntries([])
        setNextPageToken(null)
        // Page token fra Cloud Logging er kun gyldig med samme filter, så "nå" fryses her
        activeFilter.current = timeFilter(fom, tom)
        void load(null, controller.signal).finally(() => {
            if (!controller.signal.aborted) setLoading(false)
        })
        return () => controller.abort()
    }, [fom, tom, load, isDev])

    const loadMore = async () => {
        if (!nextPageToken) return
        setLoadingMore(true)
        await load(nextPageToken)
        setLoadingMore(false)
    }

    if (isDev) {
        return <Alert variant="info">Audit-logger er ikke tilgjengelig i dette miljøet. De kan kun vises i prod.</Alert>
    }

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
                <NoMessages title="Fant ingen audit-logger" />
            ) : (
                <>
                    <div className="animate-fade-in max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                        <Table className="h-max" size="small">
                            <TableHeader>
                                <TableRow>
                                    <TableHeaderCell textSize="small" />
                                    <TableHeaderCell textSize="small">Tidspunkt</TableHeaderCell>
                                    <TableHeaderCell textSize="small">Alvorlighet</TableHeaderCell>
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
                    <HStack align="center" gap="space-12">
                        <BodyShort size="small">Viser {entries.length} logger</BodyShort>
                        {nextPageToken && (
                            <Button size="small" variant="secondary" onClick={loadMore} loading={loadingMore}>
                                Last flere
                            </Button>
                        )}
                    </HStack>
                </>
            )}
        </div>
    )
}
