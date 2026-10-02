'use client'

import React, { useEffect, useState } from 'react'
import { format, isValid, parseISO, subYears } from 'date-fns'
import { Alert, BodyShort, HStack, Link, Select, Skeleton, Tag, VStack } from '@navikt/ds-react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import type { ApiResponse } from '@/lib/api/types.ts'
import { isSuccessResponse } from '@/lib/api/types.ts'
import { DateRangeSelect } from '@/components/DateRangeSelect.tsx'
import { parseDateValue } from '@/lib/date.ts'
import { fetchWorkflowReport, listWorkflowRuns } from '@/app/audit/workflows/actions.ts'
import type { AuditReport, WorkflowRunSummary } from '@/app/audit/workflows/types.ts'
import { JsonView } from '@/components/JsonView.tsx'

type ReportState =
    | { status: 'idle' | 'loading' }
    | { status: 'loaded'; report: AuditReport }
    | { status: 'error'; error: string }

function formatTimestamp(value: string): string {
    const date = parseISO(value)
    return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm') : value
}

function statusVariant(status: string | null): 'success' | 'error' | 'neutral' {
    if (status === 'success') return 'success'
    if (status === 'failure' || status === 'timed_out') return 'error'
    return 'neutral'
}

const AuditJson: React.FC<{ report: AuditReport }> = ({ report }) => (
    <JsonView json={report} className="max-h-[70vh] overflow-auto" />
)

const WorkflowRow: React.FC<{ row: WorkflowRunSummary }> = ({ row }) => {
    const [report, setReport] = useState<ReportState>({ status: 'idle' })

    const onOpenChange = (next: boolean) => {
        if (!next || report.status === 'loading' || report.status === 'loaded') return

        setReport({ status: 'loading' })
        void fetchWorkflowReport(row.runId).then((response) => {
            setReport(
                isSuccessResponse(response)
                    ? { status: 'loaded', report: response.data }
                    : { status: 'error', error: response.error }
            )
        })
    }

    const [owner, repo] = row.repository.split('/')
    const content =
        report.status === 'loading' ? (
            <BodyShort size="small">Laster …</BodyShort>
        ) : report.status === 'error' ? (
            <Alert variant="error" size="small">
                {report.error}
            </Alert>
        ) : report.status === 'loaded' ? (
            <AuditJson report={report.report} />
        ) : null

    return (
        <TableExpandableRow onOpenChange={onOpenChange} content={content}>
            <TableDataCell>{formatTimestamp(row.updatedAt)}</TableDataCell>
            <TableDataCell>{row.app}</TableDataCell>
            <TableDataCell>{row.workflowFile}</TableDataCell>
            <TableDataCell>{row.runId}</TableDataCell>
            <TableDataCell>{row.attemptCount}</TableDataCell>
            <TableDataCell>
                <Link
                    href={`https://github.com/${owner}/${repo}/commit/${row.headSha}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <code>{row.headSha.slice(0, 7)}</code>
                </Link>
            </TableDataCell>
            <TableDataCell>{row.commitMessage ?? '—'}</TableDataCell>
            <TableDataCell>
                <Tag size="xsmall" variant={statusVariant(row.conclusion)}>
                    {row.conclusion ?? 'ukjent'}
                </Tag>
            </TableDataCell>
        </TableExpandableRow>
    )
}

export const WorkflowAuditView: React.FC = () => {
    const [list, setList] = useState<ApiResponse<WorkflowRunSummary[]> | null>(null)
    const [from, setFrom] = useState(subYears(new Date(), 1).toISOString())
    const [to, setTo] = useState('now')
    const [app, setApp] = useState('alle')
    const [apps, setApps] = useState<string[]>([])

    useEffect(() => {
        let active = true
        setList(null)
        void listWorkflowRuns({
            from: parseDateValue(from),
            to: parseDateValue(to),
            app: app === 'alle' ? undefined : app,
        }).then((response) => {
            if (!active) return
            if (isSuccessResponse(response)) {
                setApps((current) => [...new Set([...current, ...response.data.map((row) => row.app)])].sort())
                setList({
                    data: response.data.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
                    error: null,
                })
                return
            }
            setList(response)
        })
        return () => {
            active = false
        }
    }, [app, from, to])

    const rows = list && isSuccessResponse(list) ? list.data : []

    return (
        <VStack gap="space-16">
            <HStack gap="space-8" align="end" wrap>
                <DateRangeSelect from={from} to={to} updateFrom={setFrom} updateTo={setTo} />
                <Select
                    label="App"
                    size="small"
                    value={app}
                    onChange={(event) => setApp(event.target.value)}
                >
                    <option value="alle">Alle</option>
                    {apps.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </Select>
            </HStack>

            {list === null ? (
                <Skeleton height={160} />
            ) : !isSuccessResponse(list) ? (
                <Alert variant="error">{list.error}</Alert>
            ) : rows.length === 0 ? (
                <BodyShort>Ingen workflow-runs i valgt periode.</BodyShort>
            ) : (
                <div className="overflow-x-auto">
                    <Table size="small">
                        <caption className="sr-only">Workflow-runs fra Speiderhytta</caption>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell />
                                <TableHeaderCell scope="col" textSize="small">Tidspunkt</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">App</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">Workflow</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">Run</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">Attempts</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">Commit</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">Commit-melding</TableHeaderCell>
                                <TableHeaderCell scope="col" textSize="small">Resultat</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row) => (
                                <WorkflowRow key={row.runId} row={row} />
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </VStack>
    )
}
