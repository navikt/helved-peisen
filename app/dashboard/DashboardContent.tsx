'use client'

import { Alert, Box, Heading, HGrid, Loader, VStack } from '@navikt/ds-react'
import { Topics } from '@/app/kafka/types.ts'
import StatusStatCard, { type StatusStatCardStatus } from '@/components/StatusStatCard.tsx'
import AvstemmingStatusList from '@/app/dashboard/AvstemmingStatusList.tsx'
import ManglendeKvitteringTable from '@/app/dashboard/ManglendeKvitteringTable.tsx'
import DobbeltutbetalingTable from '@/app/dashboard/DobbeltutbetalingTable.tsx'
import { useDashboard } from '@/app/dashboard/DashboardContext.tsx'
import type { DashboardSection } from '@/app/dashboard/types.ts'

function kafkaLink(params: Record<string, string>): string {
    return `/kafka?${new URLSearchParams(params).toString()}`
}

function SectionError({ error }: { error: string }) {
    return <Alert variant="error">{error}</Alert>
}

function cardStatus(
    section: DashboardSection<unknown>,
    count: number
): { status: StatusStatCardStatus; statusLabel: string; value: string } {
    if (section.error) {
        return { status: 'neutral', statusLabel: 'Feil', value: '-' }
    }
    return { status: count > 0 ? 'error' : 'ok', statusLabel: count > 0 ? 'Sjekk' : 'OK', value: `${count}` }
}

export const DashboardContent: React.FC = () => {
    const { summary, loading } = useDashboard()

    if (!summary) {
        return (
            <div className="flex justify-center p-16">
                <Loader size="large" title="Laster dashboard..." />
            </div>
        )
    }

    const feiletCount = summary.feilet.data?.count ?? 0
    const pendingMismatchCount = summary.pendingMismatch.data?.count ?? 0
    const avstemmingTotalAntall = summary.avstemming.data?.length ?? 0
    const avstemmingManglerAntall = summary.avstemming.data?.filter((s) => s.harKjort).length ?? 0
    const manglendeKvitteringAntall = summary.manglendeKvittering.data?.length ?? 0
    const dobbeltutbetalingAntall = summary.dobbeltutbetalinger.data?.length ?? 0

    const feiletCard = cardStatus(summary.feilet, feiletCount)
    const pendingMismatchCard = cardStatus(summary.pendingMismatch, pendingMismatchCount)
    const avstemmingCard = {
        ...cardStatus(summary.avstemming, avstemmingManglerAntall),
        value: summary.avstemming.error ? '-' : `${avstemmingManglerAntall}/${avstemmingTotalAntall}`,
    }
    const manglendeKvitteringCard = cardStatus(summary.manglendeKvittering, manglendeKvitteringAntall)
    const dobbeltutbetalingCard = cardStatus(summary.dobbeltutbetalinger, dobbeltutbetalingAntall)

    return (
        <VStack gap="space-32" className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <HGrid columns={{ xs: 1, sm: 2, lg: 5 }} gap="space-20">
                <a
                    href={kafkaLink({ status: 'FEILET', fom: summary.fom, tom: summary.tom })}

                >
                    <StatusStatCard
                        label="Feilet"
                        value={feiletCard.value}
                        status={feiletCard.status}
                        statusLabel={feiletCard.statusLabel}
                    />
                </a>
                <a
                    href={kafkaLink({
                        topics: `${Topics.utbetalinger},${Topics.pendingUtbetalinger}`,
                        pendingMismatch: 'true',
                        fom: summary.fom,
                        tom: summary.tom,
                    })}
                    className={'block h-full no-underline rounded-lg focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-(--ax-border-focus)'
                    }
                >
                    <StatusStatCard
                        label="Pending mismatch"
                        value={pendingMismatchCard.value}
                        status={pendingMismatchCard.status}
                        statusLabel={pendingMismatchCard.statusLabel}
                    />
                </a>
                <StatusStatCard
                    label="Avstemming i går"
                    value={avstemmingCard.value}
                    status={avstemmingCard.status}
                    statusLabel={avstemmingCard.statusLabel}
                />
                <StatusStatCard
                    label="Mangler kvittering"
                    value={manglendeKvitteringCard.value}
                    status={manglendeKvitteringCard.status}
                    statusLabel={manglendeKvitteringCard.statusLabel}
                />
                <StatusStatCard
                    label="Dobbeltutbetalinger"
                    value={dobbeltutbetalingCard.value}
                    status={dobbeltutbetalingCard.status}
                    statusLabel={dobbeltutbetalingCard.statusLabel}
                />
            </HGrid>

            <VStack gap="space-20">
                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Avstemming per fagsystem
                    </Heading>
                    <Box padding="space-16">
                        {summary.avstemming.error ? (
                            <SectionError error={summary.avstemming.error} />
                        ) : (
                            <AvstemmingStatusList statuser={summary.avstemming.data ?? []} />
                        )}
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Oppdrag som mangler kvittering
                    </Heading>
                    <Box padding="space-16">
                        {summary.manglendeKvittering.error ? (
                            <SectionError error={summary.manglendeKvittering.error} />
                        ) : (
                            <ManglendeKvitteringTable manglende={summary.manglendeKvittering.data ?? []} />
                        )}
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Potensielle dobbeltutbetalinger
                    </Heading>
                    <Box padding="space-16">
                        {summary.dobbeltutbetalinger.error ? (
                            <SectionError error={summary.dobbeltutbetalinger.error} />
                        ) : (
                            <DobbeltutbetalingTable kandidater={summary.dobbeltutbetalinger.data ?? []} />
                        )}
                    </Box>
                </VStack>
            </VStack>
        </VStack>
    )
}
