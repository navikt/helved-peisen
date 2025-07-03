import { useTimeline } from './TimelineContext'

import styles from './TimelinePeriod.module.css'

export type TimelineEventProps = {
    date: Date
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({
    date: start,
}) => {
    const timeline = useTimeline()

    const startPositionPercentage =
        ((start.getTime() - timeline.start.getTime()) /
            (timeline.end.getTime() - timeline.start.getTime())) *
        100

    return (
        <div
            className={styles.period}
            style={{
                left: `${startPositionPercentage}%`,
            }}
        ></div>
    )
}
