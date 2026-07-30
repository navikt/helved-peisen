'use client'

import { Alert, Box, Heading, HGrid, Loader, VStack } from '@navikt/ds-react'
import { Topics } from '@/app/kafka/types.ts'
import { StatusStatCard, type StatusStatCardStatus } from '@/components/StatusStatCard.tsx'
import AvstemmingStatusList from '@/app/dashboard/AvstemmingStatusList.tsx'
import ManglendeKvitteringTable from '@/app/dashboard/ManglendeKvitteringTable.tsx'
import DobbeltutbetalingTable from '@/app/dashboard/DobbeltutbetalingTable.tsx'
import { useDashboard } from '@/app/dashboard/DashboardContext.tsx'
import type { DashboardSection } from '@/app/dashboard/types.ts'
import { AvstemmingCard } from './AvstemmingCard'

function kafkaLink(params: Record<string, string>): string {
    return `/kafka?${new URLSearchParams(params).toString()}`
}

function SectionError({ error }: { error: string }) {
    return <Alert variant="error">{error}</Alert>
}

function cardStatus(
    section: DashboardSection<unknown> | null,
    count: number
): { status: StatusStatCardStatus; statusLabel: string; value: string } {
    if (!section) {
        return { status: 'neutral', statusLabel: 'Laster', value: '-' }
    }
    if (section.error) {
        return { status: 'neutral', statusLabel: 'Feil', value: '-' }
    }
    return { status: count > 0 ? 'error' : 'ok', statusLabel: count > 0 ? 'Sjekk' : 'OK', value: `${count}` }
}

export const DashboardContent: React.FC = () => {
    const {
        summary,
        loading,
        manglendeKvittering,
        manglendeKvitteringLoading,
        dobbeltutbetalinger,
        dobbeltutbetalingerLoading,
    } = useDashboard()

    if (loading) {
        return (
            <div className="flex justify-center p-16">
                <Loader size="large" title="Laster dashboard..." />
            </div>
        )
    }

    if (!summary) {
        return <Alert variant="error">Klarte ikke hente dashboard</Alert>
    }

    const feiletCount = summary.feilet.data?.count ?? 0
    const pendingMismatchCount = summary.pendingMismatch.data?.count ?? 0
    const manglendeKvitteringAntall = manglendeKvittering?.data?.length ?? 0
    const dobbeltutbetalingAntall = dobbeltutbetalinger?.data?.length ?? 0

    const feiletCard = cardStatus(summary.feilet, feiletCount)
    const pendingMismatchCard = cardStatus(summary.pendingMismatch, pendingMismatchCount)
    const manglendeKvitteringCard = cardStatus(manglendeKvittering, manglendeKvitteringAntall)
    const dobbeltutbetalingCard = cardStatus(dobbeltutbetalinger, dobbeltutbetalingAntall)

    return (
        <VStack gap="space-32" className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <HGrid columns={{ xs: 1, sm: 2, lg: 5 }} gap="space-20">
                <a href={kafkaLink({ status: 'FEILET', fom: summary.fom, tom: summary.tom })}>
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
                >
                    <StatusStatCard
                        label="Pending mismatch"
                        value={pendingMismatchCard.value}
                        status={pendingMismatchCard.status}
                        statusLabel={pendingMismatchCard.statusLabel}
                    />
                </a>
                <AvstemmingCard avstemming={summary.avstemming} />
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
                        {manglendeKvitteringLoading || !manglendeKvittering ? (
                            <div className="flex justify-center p-8">
                                <Loader size="medium" title="Laster oppdrag som mangler kvittering..." />
                            </div>
                        ) : manglendeKvittering.error ? (
                            <SectionError error={manglendeKvittering.error} />
                        ) : (
                            <ManglendeKvitteringTable manglende={manglendeKvittering.data ?? []} />
                        )}
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Potensielle dobbeltutbetalinger
                    </Heading>
                    <Box padding="space-16">
                        {dobbeltutbetalingerLoading || !dobbeltutbetalinger ? (
                            <div className="flex justify-center p-8">
                                <Loader size="medium" title="Laster potensielle dobbeltutbetalinger..." />
                            </div>
                        ) : dobbeltutbetalinger.error ? (
                            <SectionError error={dobbeltutbetalinger.error} />
                        ) : (
                            <DobbeltutbetalingTable kandidater={dobbeltutbetalinger.data ?? []} />
                        )}
                    </Box>
                </VStack>
            </VStack>
        </VStack>
    )
}
