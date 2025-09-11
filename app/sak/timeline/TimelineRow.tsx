import { ReactElement } from 'react'

import { TimelineEvent } from './TimelineEvent'

import styles from './TimelineRow.module.css'
import { Skeleton } from '@navikt/ds-react'

export type TimelineRowProps = {
    label: string
    children: ReactElement<typeof TimelineEvent>[]
}

export const TimelineRow: React.FC<TimelineRowProps> = ({ label, children }) => {
    return (
        <>
            <div>{label}</div>
            <div className={styles.periodsContainer}>
                <div className={styles.periods}>{children}</div>
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
            <div className={styles.periodsContainer}>
                <div className={styles.periods}></div>
            </div>
        </>
    )
}
