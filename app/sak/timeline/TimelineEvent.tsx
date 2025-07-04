import { ReactNode, useRef, useState } from 'react'
import clsx from 'clsx'

import { Popover } from '@navikt/ds-react'
import { PopoverContent } from '@navikt/ds-react/Popover'
import { useTimeline } from './TimelineContext'

import styles from './TimelineEvent.module.css'

export type TimelineEventProps = {
    date: Date
    variant?: 'success' | 'warning' | 'info' | 'neutral' | 'danger'
    content?: ReactNode
    onShowContent?: () => void
    onHideContent?: () => void
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({
    date,
    variant = 'neutral',
    content,
    onShowContent,
    onHideContent,
}) => {
    const timeline = useTimeline()

    const [show, setShow] = useState(false)
    const anchor = useRef<HTMLButtonElement>(null)

    const startPositionPercentage =
        ((date.getTime() - timeline.start.getTime()) /
            (timeline.end.getTime() - timeline.start.getTime())) *
        100

    const showContent = () => {
        setShow(true)
        onShowContent?.()
    }

    const hideContent = () => {
        setShow(false)
        onHideContent?.()
    }

    return (
        <button
            className={clsx(styles.period, styles[variant])}
            style={{
                left: `${startPositionPercentage}%`,
            }}
            tabIndex={0}
            ref={anchor}
            onFocus={showContent}
            onBlur={hideContent}
            onMouseOver={showContent}
            onMouseOut={hideContent}
        >
            {!!content && (
                <Popover
                    open={show}
                    anchorEl={anchor.current}
                    onClose={() => setShow(false)}
                >
                    <PopoverContent>{content}</PopoverContent>
                </Popover>
            )}
        </button>
    )
}
