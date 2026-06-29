import { Label, VStack } from '@navikt/ds-react'
import { AvstemmingTimeline } from '@/app/avstemming/AvstemmingTimeline.tsx'
import { AvstemmingDryrunV2 } from '@/app/avstemming/AvstemmingDryrunV2.tsx'
import { AvstemmingFiltere } from '@/app/avstemming/AvstemmingFiltere.tsx'
import { LatestAvstemminger } from '@/app/avstemming/LatestAvstemminger.tsx'
import { checkToken } from '@/lib/server/auth'

import { AvstemmingProvider } from './AvstemingContext'

export default async function AvstemmingPage() {
    await checkToken()

    return (
        <div className="flex flex-col gap-16 p-4">
            <AvstemmingProvider>
                <VStack gap="space-20">
                    <AvstemmingFiltere />
                    <AvstemmingTimeline />
                </VStack>
                <LatestAvstemminger />
                <AvstemmingDryrunV2 />
            </AvstemmingProvider>
        </div>
    )
}
