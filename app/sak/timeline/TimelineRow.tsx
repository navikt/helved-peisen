import { ReactElement } from 'react'

import { TimelineEvent } from './TimelinePeriod'

import styles from './TimelineRow.module.css'

export type TimelineRowProps = {
    label: string
    children: ReactElement<typeof TimelineEvent>[]
}

export const TimelineRow: React.FC<TimelineRowProps> = ({
    label,
    children,
}) => {
    return (
        <>
            <div>{label}</div>
            <div className={styles.periodsContainer}>
                <div className={styles.periods}>{children}</div>
            </div>
        </>
    )
}
