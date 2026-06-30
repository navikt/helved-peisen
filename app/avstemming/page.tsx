import { AvstemmingTimeline } from '@/app/avstemming/AvstemmingTimeline.tsx'
import { AvstemmingFiltere } from '@/app/avstemming/AvstemmingFiltere.tsx'
import { checkToken } from '@/lib/server/auth'
import { Label } from '@navikt/ds-react'

export default async function AvstemmingPage() {
    await checkToken()

    return (
        <div className="flex flex-col gap-6 w-full">
            <Label>Tidslinje</Label>
            <AvstemmingFiltere />
            <AvstemmingTimeline />
        </div>
    )
}
