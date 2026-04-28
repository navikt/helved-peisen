'use client'

import { useState } from 'react'
import { Table, Link, Tag, BodyShort } from '@navikt/ds-react'
import {
    TableBody,
    TableColumnHeader,
    TableDataCell,
    TableHeader,
    TableRow,
} from '@navikt/ds-react/Table'
import { format } from 'date-fns'
import type { Incident } from '@/app/slo/types.ts'
import { formatDuration } from '@/app/slo/dora-summary.tsx'

type SortKey = 'openedAt' | 'resolvedAt' | 'mttrSeconds' | 'title'
type SortDirection = 'ascending' | 'descending'
type SortState = { orderBy: SortKey; direction: SortDirection }

type Props = {
    rows: Incident[] | null
    repo?: string
}

function formatTs(value: string): string {
    return format(new Date(value), 'yyyy-MM-dd HH:mm')
}

function compare(a: string | number | null, b: string | number | null, direction: SortDirection): number {
    if (a === null && b === null) return 0
    if (a === null) return direction === 'ascending' ? -1 : 1
    if (b === null) return direction === 'ascending' ? 1 : -1
    const result =
        typeof a === 'string' && typeof b === 'string'
            ? a.localeCompare(b)
            : (a as number) - (b as number)
    return direction === 'ascending' ? result : -result
}

export default function IncidentsTable({ rows, repo }: Props) {
    const [sort, setSort] = useState<SortState>({ orderBy: 'openedAt', direction: 'descending' })

    if (!rows || rows.length === 0) {
        return <BodyShort>Ingen incidents funnet.</BodyShort>
    }

    const handleSortChange = (key: string) => {
        const sortKey = key as SortKey
        setSort((current) =>
            current.orderBy === sortKey
                ? { orderBy: sortKey, direction: current.direction === 'descending' ? 'ascending' : 'descending' }
                : { orderBy: sortKey, direction: 'descending' }
        )
    }

    const sortedRows = [...rows].sort((a, b) => compare(a[sort.orderBy], b[sort.orderBy], sort.direction))

    return (
        <Table sort={sort} onSortChange={handleSortChange}>
            <TableHeader>
                <TableRow>
                    <TableColumnHeader sortKey="openedAt" sortable>Opened</TableColumnHeader>
                    <TableColumnHeader sortKey="resolvedAt" sortable>Resolved</TableColumnHeader>
                    <TableColumnHeader sortKey="mttrSeconds" sortable>MTTR</TableColumnHeader>
                    <TableColumnHeader sortKey="title" sortable>Title</TableColumnHeader>
                    <TableColumnHeader>Issue</TableColumnHeader>
                    <TableColumnHeader>Status</TableColumnHeader>
                    <TableColumnHeader>Caused by</TableColumnHeader>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedRows.map((incident) => {
                    const issueUrl = repo
                        ? `https://github.com/${repo}/issues/${incident.githubIssue}`
                        : null
                    const isOpen = incident.resolvedAt === null
                    return (
                        <TableRow key={incident.id ?? incident.githubIssue}>
                            <TableDataCell>{formatTs(incident.openedAt)}</TableDataCell>
                            <TableDataCell>
                                {incident.resolvedAt ? formatTs(incident.resolvedAt) : '—'}
                            </TableDataCell>
                            <TableDataCell>
                                {incident.mttrSeconds === null ? '—' : formatDuration(incident.mttrSeconds)}
                            </TableDataCell>
                            <TableDataCell>{incident.title}</TableDataCell>
                            <TableDataCell>
                                {issueUrl ? (
                                    <Link href={issueUrl} target="_blank" rel="noreferrer">
                                        #{incident.githubIssue}
                                    </Link>
                                ) : (
                                    `#${incident.githubIssue}`
                                )}
                            </TableDataCell>
                            <TableDataCell>
                                <Tag size="small" variant={isOpen ? 'error' : 'success'}>
                                    {isOpen ? 'open' : 'resolved'}
                                </Tag>
                            </TableDataCell>
                            <TableDataCell>
                                {incident.causedBySha ? (
                                    <code>{incident.causedBySha.slice(0, 7)}</code>
                                ) : (
                                    '—'
                                )}
                            </TableDataCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
