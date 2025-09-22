import { ReactElement } from 'react'

import { Skeleton } from '@navikt/ds-react'
import { TimelineEvent } from './TimelineEvent'

export type TimelineRowProps = {
    label: string
    children: ReactElement<typeof TimelineEvent>[]
}

export const TimelineRow: React.FC<TimelineRowProps> = ({ label, children }) => {
    return (
        <>
            <div>{label}</div>
            <div className="bg-(--ax-bg-neutral-moderate) py-0 px-6">
                <div className="relative min-h-6 w-full">{children}</div>
            </div>
        </>
    )
}

export const TimelineRowSkeleton = () => {
    return (
        <>
            <div>
                <Skeleton />
            </div>
            <div className="bg-(--ax-bg-neutral-moderate) py-0 px-6">
                <div className="relative min-h-6 w-full"></div>
            </div>
        </>
    )
}
