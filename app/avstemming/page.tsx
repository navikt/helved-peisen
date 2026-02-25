import { AvstemmingTimeline } from '@/app/avstemming/AvstemmingTimeline.tsx'
import { LatestAvstemminger } from '@/app/avstemming/LatestAvstemminger'
import { AvstemmingDryrun } from '@/app/avstemming/AvstemmingDryrun.tsx'
import { fetchAvstemminger } from '@/lib/io.ts'
import { AvstemmingDryrunV2 } from '@/app/avstemming/AvstemmingDryrunV2.tsx'

export default async function AvstemmingPage() {
    const xmlMessages = await fetchAvstemminger()

    return (
        <div className="flex flex-col gap-12 p-8">
            <AvstemmingTimeline xmlMessages={xmlMessages} />
            <LatestAvstemminger xmlMessages={xmlMessages} />
            <AvstemmingDryrun />
            <AvstemmingDryrunV2 />
        </div>
    )
}
