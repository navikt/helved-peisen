import { ReactElement, ReactNode, useMemo } from 'react'
import { VStack } from '@navikt/ds-react'
import { isAfter, isBefore } from 'date-fns'

import { TimelineRow, TimelineRowProps } from './TimelineRow.tsx'
import { TimelineProvider } from './TimelineContext.tsx'
import { TimelineEventProps } from './TimelineEvent.tsx'

import styles from './Timeline.module.css'

type Props = {
    children: ReactElement<typeof TimelineRow>[]
}

const useTimelineRange = (children: Props['children']) => {
    return useMemo(() => {
        const range = children.reduce(
            ({ start, end }, row: ReactElement<typeof TimelineRow>) => {
                const props = row.props as unknown as TimelineRowProps
                const { min, max } = props.children.reduce(
                    ({ min, max }, period) => {
                        const props = period.props as unknown as TimelineEventProps
                        const date = props.date
                        return {
                            min: isBefore(date, min) ? date : min,
                            max: isAfter(date, max) ? date : max,
                        }
                    },
                    {
                        min: new Date(),
                        max: new Date(0),
                    }
                )
                return {
                    start: isBefore(min, start) ? min : start,
                    end: isAfter(max, end) ? max : end,
                }
            },
            {
                start: new Date(),
                end: new Date(0),
            }
        )
        return [range.start, range.end]
    }, [children])
}

export const Timeline: React.FC<Props> = ({ children }) => {
    const [start, end] = useTimelineRange(children)

    return (
        <VStack className={styles.timeline} gap="space-4">
            <TimelineProvider start={start} end={end}>
                {children}
            </TimelineProvider>
        </VStack>
    )
}

export const TimelineSkeleton: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <VStack className={styles.timeline} gap="space-4">
            {children}
        </VStack>
    )
}
