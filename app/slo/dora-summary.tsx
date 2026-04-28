'use client'

import { Heading, VStack, DatePicker, useRangeDatepicker } from '@navikt/ds-react'
import StatCard from '@/app/slo/stat-card.tsx'
import { subDays } from 'date-fns'

export type DoraTotals = {
    activeApps: number
    totalDeploys: number
    totalIncidents: number
    avgLead: number | null
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
    const today = new Date()
    const defaultFrom = windowFrom ? new Date(windowFrom) : subDays(today, 30)
    const defaultTo = windowTo ? new Date(windowTo) : today

    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        defaultSelected: { from: defaultFrom, to: defaultTo },
    })

    return (
        <VStack gap="space-16" className="mb-8">
            <header className="mb-8">
                <Heading level="2" size="large" spacing>
                    DORA Metrics
                </Heading>
                <DatePicker {...datepickerProps}>
                    <div className="flex gap-4">
                        <DatePicker.Input {...fromInputProps} label="Fra" size="small" />
                        <DatePicker.Input {...toInputProps} label="Til" size="small" />
                    </div>
                </DatePicker>
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
