import { BodyShort, Heading, VStack } from '@navikt/ds-react'
import StatCard from '@/app/slo/stat-card.tsx'
import { format } from 'date-fns'

export type DoraTotals = {
    activeApps: number
    totalDeploys: number
    totalIncidents: number
    avgLead: number | null
}

function formatDate(value?: string): string {
    if (!value) {
        return '-'
    }
    return format(new Date(value), 'yyyy-MM-dd, HH:mm:ss')
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    }
    const rounded = Math.round(seconds)
    const minutes = Math.floor(rounded / 60)
    const remainingSeconds = rounded % 60
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
}

export default function DoraSummary({
                                        windowFrom,
                                        windowTo,
                                        appCount,
                                        totals,
                                    }: {
    windowFrom?: string
    windowTo?: string
    appCount: number
    totals: DoraTotals
}) {
    return (
        <VStack gap="space-16" className="mb-8">
            <header>
                <Heading level="2" size="large" spacing>
                    DORA Metrics
                </Heading>
                <BodyShort size="small">
                    {formatDate(windowFrom)} {'\u2192'} {formatDate(windowTo)} · 30-day window
                </BodyShort>
            </header>
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Apps tracked" value={String(appCount)} hint={`${totals.activeApps} active`} />
                <StatCard label="Deployments" value={String(totals.totalDeploys)} hint="last 30 days" />
                <StatCard label="Incidents" value={String(totals.totalIncidents)} hint="last 30 days" />
                <StatCard
                    label="Avg. lead time"
                    value={totals.avgLead === null ? '—' : formatDuration(totals.avgLead)}
                    hint="median across apps"
                />
            </section>
        </VStack>
    )
}
