'use client'

import { useState } from 'react'
import { Table, Link } from '@navikt/ds-react'
import {
    TableBody,
    TableColumnHeader,
    TableDataCell,
    TableHeader,
    TableRow,
} from '@navikt/ds-react/Table'
import type { DoraResponse } from '@/app/slo/types.ts'
import { formatDuration } from '@/app/slo/dora-summary.tsx'
import {
    changeFailureLevel,
    deployFrequencyLevel,
    DoraLevel,
    leadTimeLevel,
    levelClassName,
    levelLabel,
    mttrLevel,
} from '@/app/slo/dora-thresholds.ts'

type SortKey =
    | 'app'
    | 'deployFrequencyPerDay'
    | 'leadTimeMedianSeconds'
    | 'leadTimeP90Seconds'
    | 'changeFailureRate'
    | 'mttrMedianSeconds'
    | 'deploymentCount'
    | 'incidentCount'

type SortDirection = 'ascending' | 'descending'

type SortState = {
    orderBy: SortKey
    direction: SortDirection
}

type Props = {
    rows: DoraResponse[]
}

function formatDeployFrequencyPerDay(value: number | null): string {
    if (value === null) {
        return '-'
    }
    return `${value.toFixed(2)}/day`
}

function formatLeadTimeInSeconds(value: number | null): string {
    if (value === null) {
        return '-'
    }
    return formatDuration(value)
}

function formatChangeFailureRate(value: number | null): string {
    if (value === null) {
        return '-'
    }
    return `${(value * 100).toFixed(1)}%`
}

function LevelCell({ level, children }: { level: DoraLevel | null; children: React.ReactNode }) {
    const className = levelClassName(level)
    const title = levelLabel(level)
    if (!className) {
        return <TableDataCell>{children}</TableDataCell>
    }
    return (
        <TableDataCell>
            <span className={className} title={title}>
                {children}
            </span>
        </TableDataCell>
    )
}

function compareValues(a: string | number | null, b: string | number | null, direction: SortDirection): number {
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    const result = typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b) : (a as number) - (b as number)
    return direction === 'ascending' ? result : -result
}

export default function DoraTable({ rows }: Props) {
    const [sort, setSort] = useState<SortState>({ orderBy: 'deployFrequencyPerDay', direction: 'descending' })

    const handleSortChange = (key: string) => {
        const sortKey = key as SortKey
        setSort((current) => {
            if (current.orderBy !== sortKey) {
                return { orderBy: sortKey, direction: 'descending' }
            }
            return {
                orderBy: sortKey,
                direction: current.direction === 'descending' ? 'ascending' : 'descending',
            }
        })
    }

    const sortedRows = [...rows].sort((a, b) => compareValues(a[sort.orderBy], b[sort.orderBy], sort.direction))

    return (
        <Table sort={sort} onSortChange={handleSortChange}>
            <TableBody>
                {sortedRows.map((dora) => (
                    <TableRow key={dora.app}>
                        <TableDataCell>
                            <Link href={`/slo/${dora.app}`}>{dora.app}</Link>
                        </TableDataCell>
                        <LevelCell level={deployFrequencyLevel(dora.deployFrequencyPerDay)}>
                            {formatDeployFrequencyPerDay(dora.deployFrequencyPerDay)}
                        </LevelCell>
                        <LevelCell level={leadTimeLevel(dora.leadTimeMedianSeconds)}>
                            {formatLeadTimeInSeconds(dora.leadTimeMedianSeconds)}
                        </LevelCell>
                        <LevelCell level={leadTimeLevel(dora.leadTimeP90Seconds)}>
                            {formatLeadTimeInSeconds(dora.leadTimeP90Seconds)}
                        </LevelCell>
                        <LevelCell level={changeFailureLevel(dora.changeFailureRate)}>
                            {formatChangeFailureRate(dora.changeFailureRate)}
                        </LevelCell>
                        <LevelCell level={mttrLevel(dora.mttrMedianSeconds)}>
                            {formatLeadTimeInSeconds(dora.mttrMedianSeconds)}
                        </LevelCell>
                        <TableDataCell>{dora.deploymentCount ?? '-'}</TableDataCell>
                        <TableDataCell>{dora.incidentCount ?? '-'}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableHeader>
                <TableRow>
                    <TableColumnHeader sortKey="app" sortable>
                        App
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="deployFrequencyPerDay" sortable>
                        Deploy freq.
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="leadTimeMedianSeconds" sortable>
                        Lead time (median)
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="leadTimeP90Seconds" sortable>
                        Lead time (P90)
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="changeFailureRate" sortable>
                        Change failure
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="mttrMedianSeconds" sortable>
                        MTTR
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="deploymentCount" sortable>
                        Deploys
                    </TableColumnHeader>
                    <TableColumnHeader sortKey="incidentCount" sortable>
                        Incidents
                    </TableColumnHeader>
                </TableRow>
            </TableHeader>
        </Table>
    )
}
