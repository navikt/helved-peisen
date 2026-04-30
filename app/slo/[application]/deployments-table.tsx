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
import type { Deployment, DeploymentOutcome } from '@/app/slo/types.ts'
import { formatDuration } from '@/app/slo/format.ts'

type SortKey = 'deployFinishedTs' | 'leadTimeSeconds' | 'outcome' | 'sha'
type SortDirection = 'ascending' | 'descending'
type SortState = { orderBy: SortKey; direction: SortDirection }

type Props = {
    rows: Deployment[] | null
}

function formatTs(value: string): string {
    return format(new Date(value), 'yyyy-MM-dd HH:mm')
}

function outcomeVariant(outcome: DeploymentOutcome): 'success' | 'error' | 'neutral' {
    switch (outcome) {
        case 'success':
            return 'success'
        case 'failure':
            return 'error'
        default:
            return 'neutral'
    }
}

function compare(a: string | number, b: string | number, direction: SortDirection): number {
    const result = typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : (a as number) - (b as number)
    return direction === 'ascending' ? result : -result
}

export default function DeploymentsTable({ rows }: Props) {
    const [sort, setSort] = useState<SortState>({ orderBy: 'deployFinishedTs', direction: 'descending' })

    if (!rows || rows.length === 0) {
        return <BodyShort>Ingen deployments funnet.</BodyShort>
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
                    <TableColumnHeader sortKey="deployFinishedTs" sortable>Deployed</TableColumnHeader>
                    <TableColumnHeader sortKey="sha" sortable>Commit</TableColumnHeader>
                    <TableColumnHeader>Env</TableColumnHeader>
                    <TableColumnHeader sortKey="leadTimeSeconds" sortable>Lead time</TableColumnHeader>
                    <TableColumnHeader sortKey="outcome" sortable>Outcome</TableColumnHeader>
                    <TableColumnHeader>Run</TableColumnHeader>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedRows.map((deployment) => (
                    <TableRow key={deployment.id}>
                        <TableDataCell>{formatTs(deployment.deployFinishedTs)}</TableDataCell>
                        <TableDataCell>
                            <code>{deployment.sha.slice(0, 7)}</code>
                        </TableDataCell>
                        <TableDataCell>{deployment.env}</TableDataCell>
                        <TableDataCell>{formatDuration(deployment.leadTimeSeconds)}</TableDataCell>
                        <TableDataCell>
                            <Tag size="small" variant={outcomeVariant(deployment.outcome)}>
                                {deployment.outcome}
                            </Tag>
                        </TableDataCell>
                        <TableDataCell>
                            {deployment.runUrl ? (
                                <Link href={deployment.runUrl} target="_blank" rel="noreferrer">
                                    #{deployment.runId}
                                </Link>
                            ) : (
                                `#${deployment.runId}`
                            )}
                        </TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
