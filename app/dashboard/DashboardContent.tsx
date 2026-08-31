'use client'

import { useState } from 'react'
import { Alert, Box, Heading, HGrid, VStack } from '@navikt/ds-react'
import { StatusStatCardSkeleton } from '@/components/StatusStatCard.tsx'
import {
    ManglendeKvitteringTable,
    ManglendeKvitteringTableSkeleton,
} from '@/app/dashboard/ManglendeKvitteringTable.tsx'
import { DobbeltutbetalingTable, DobbeltUtbetalingTableSkeleton } from '@/app/dashboard/DobbeltutbetalingTable.tsx'
import { useDashboard } from '@/app/dashboard/DashboardContext.tsx'
import { FeiletCard } from './FeiletCard'
import { PendingMismatchCard } from './PendingMismatchCard'
import { ManglendeKvitteringCard } from '@/app/dashboard/ManglendeKvitteringCard'
import { isSuccessResponse } from '@/lib/api/types'
import { AvstemmingCard } from '@/app/dashboard/AvstemmingCard.tsx'
import { AvstemmingStatusList, AvstemmingStatusListSkeleton } from '@/app/dashboard/AvstemmingStatusList.tsx'
import { DobbeltUtbetalingCard } from './DobbeltUtbetalingCard'
import { FeiletUtbetalingTable, FeiletUtbetalingTableSkeleton } from './FeiletUtbetalingTable'

export const DashboardContent: React.FC = () => {
    const { fom, tom, dashboard, loading } = useDashboard()
    const [håndterteNøkler, setHåndterteNøkler] = useState<Set<string>>(new Set())

    const håndter = (nøkkel: string) => {
        setHåndterteNøkler((prev) => new Set([...prev,nøkkel]))
    }

    if (loading) {
        return <DashboardContentSkeleton />
    }

    if (!dashboard || !isSuccessResponse(dashboard)) {
        return <Alert variant="error">Klarte ikke hente dashboard</Alert>
    }

    const synlige = dashboard.data.dobbeltutbetalinger.filter(
        (utbetaling) => !håndterteNøkler.has(`${utbetaling.behandlingId}-${utbetaling.klassekode}-${utbetaling.fom}-${utbetaling.tom}`)
    )

    return (
        <VStack gap="space-32" className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <HGrid columns={{ xs: 1, sm: 2, lg: 5 }} gap="space-20">
                <FeiletCard antallFeilet={dashboard.data.feiletUtbetalinger.length} fom={fom} tom={tom} />
                <PendingMismatchCard antallMismatch={dashboard.data.pendingMismatch.length} fom={fom} tom={tom} />
                <AvstemmingCard avstemming={dashboard.data.avstemming} />
                <ManglendeKvitteringCard antallManglendeKvitteringer={dashboard.data.oppdragUtenKvittering.length} />
                <DobbeltUtbetalingCard antallDobleUtbetalinger={synlige.length} />
            </HGrid>

            <VStack gap="space-20">
                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Avstemming per fagsystem
                    </Heading>
                    <Box padding="space-16">
                        <AvstemmingStatusList avstemminger={dashboard.data.avstemming} />
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Oppdrag som mangler kvittering
                    </Heading>
                    <Box padding="space-16">
                        <ManglendeKvitteringTable manglende={dashboard.data.oppdragUtenKvittering} />
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Potensielle dobbeltutbetalinger
                    </Heading>
                    <Box padding="space-16">
                        <DobbeltutbetalingTable dobbeltutbetalinger={synlige} onHåndtert={håndter} />
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Feilet utbetalinger
                    </Heading>
                    <Box padding="space-16">
                        <FeiletUtbetalingTable
                            feiletUtbetalinger={dashboard.data.feiletUtbetalinger}
                            korrigerteFeiletUtbetalinger={dashboard.data.korrigerteFeiletUtbetalinger}
                        />
                    </Box>
                </VStack>
            </VStack>
        </VStack>
    )
}

const DashboardContentSkeleton: React.FC = () => {
    return (
        <VStack gap="space-32">
            <HGrid columns={{ xs: 1, sm: 2, lg: 5 }} gap="space-20">
                <StatusStatCardSkeleton />
                <StatusStatCardSkeleton />
                <StatusStatCardSkeleton />
                <StatusStatCardSkeleton />
                <StatusStatCardSkeleton />
            </HGrid>

            <VStack gap="space-20">
                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Avstemming per fagsystem
                    </Heading>
                    <Box padding="space-16">
                        <AvstemmingStatusListSkeleton />
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Oppdrag som mangler kvittering
                    </Heading>
                    <Box padding="space-16">
                        <ManglendeKvitteringTableSkeleton />
                    </Box>
                </VStack>

                <VStack gap="space-12">
                    <Heading level="2" size="small">
                        Potensielle dobbeltutbetalinger
                    </Heading>
                    <Box padding="space-16">
                        <DobbeltUtbetalingTableSkeleton />
                    </Box>
                </VStack>
            </VStack>

            <VStack gap="space-12">
                <Heading level="2" size="small">
                    Feilet utbetalinger
                </Heading>
                <Box padding="space-16">
                    <FeiletUtbetalingTableSkeleton />
                </Box>
            </VStack>
        </VStack>
    )
}
