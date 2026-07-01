import { Label } from '@navikt/ds-react'

import { checkToken } from '@/lib/server/auth'
import { AvstemmingTimeline } from '@/app/avstemming/AvstemmingTimeline.tsx'
import { AvstemmingFiltere } from '@/app/avstemming/AvstemmingFiltere.tsx'
import { LatestAvstemminger } from '@/app/avstemming/LatestAvstemminger.tsx'

export default async function AvstemmingPage() {
    await checkToken()

    return (
        <div className="flex flex-col gap-24 w-full">
            <div className="flex flex-col gap-6">
                <AvstemmingFiltere />
                <AvstemmingTimeline />
            </div>
            <LatestAvstemminger />
        </div>
    )
}
