'use client'

import { useState } from 'react'
import { subDays } from 'date-fns'
import { Alert, BodyShort, Link } from '@navikt/ds-react'

import { NoMessages } from '@/components/NoMessages.tsx'
import { DateRangeSelect } from '@/components/DateRangeSelect.tsx'
import { AuditLogsSkeleton } from '@/app/audit/logs/AuditLogsSkeleton.tsx'
import { AuditLogsTableView } from '@/app/audit/logs/AuditLogsTableView.tsx'
import { useAuditLogs } from '@/app/audit/logs/useAuditLogs.ts'

const AuditLogsTable = () => {
    const [fom, setFom] = useState(() => subDays(new Date(), 30).toISOString())
    const [tom, setTom] = useState('now')
    const [pageSize, setPageSize] = useState(100)
    const { entries, page, pageCount, loading, error, changePage } = useAuditLogs({ fom, tom, pageSize })

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
                <AuditLogsTableView
                    entries={entries}
                    page={page}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    onPageChange={(page) => void changePage(page)}
                    onPageSizeChange={setPageSize}
                />
            )}
        </div>
    )
}

export const AuditLogs = () =>
    process.env.NODE_ENV !== 'production' ? (
        <Alert variant="info">Audit-logger er ikke tilgjengelig i dette miljøet.</Alert>
    ) : (
        <section className="flex flex-col">
            <BodyShort className="mb-8">
                Denne siden viser audit logs fra <Link
                href="https://console.cloud.google.com/logs/query;storageScope=storage,projects%2Fhelved-prod-119e%2Flocations%2Feurope-north1%2Fbuckets%2FTeamAudit%2Fviews%2F_AllLogs;duration=P30D?project=helved-prod-119e"
                target="_blank"
                rel="noopener noreferrer"
            >
                TeamAudit bøtten i GCP
            </Link>
            </BodyShort>
        <AuditLogsTable />
        </section>
    )
