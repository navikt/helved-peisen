import { AvstemmingTimeline } from '@/app/avstemming/AvstemmingTimeline.tsx'
import { LatestAvstemminger } from '@/app/avstemming/LatestAvstemminger'
import { AvstemmingDryrun } from '@/app/avstemming/AvstemmingDryrun.tsx'
import { AvstemmingDryrunV2 } from '@/app/avstemming/AvstemmingDryrunV2.tsx'
import { fetchAvstemminger } from '@/app/avstemming/actions.ts'
import { checkToken } from '@/lib/server/auth'
import { isSuccessResponse } from '@/lib/api/types'
import { Alert } from '@navikt/ds-react'

export default async function AvstemmingPage() {
    await checkToken()
    const res = await fetchAvstemminger()

    if (!isSuccessResponse(res)) {
        return (
            <div className="flex flex-col gap-12 p-4">
                <Alert variant="error">{res.error}</Alert>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-12 p-4">
            <AvstemmingTimeline xmlMessages={res.data} />
            <LatestAvstemminger xmlMessages={res.data} />
            <AvstemmingDryrun />
            <AvstemmingDryrunV2 />
        </div>
    )
}
