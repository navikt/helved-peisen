import { ReactNode, useRef, useState } from 'react'
import clsx from 'clsx'

import { Popover } from '@navikt/ds-react'
import { PopoverContent } from '@navikt/ds-react/Popover'
import { useTimeline } from './TimelineContext'

export type TimelineEventProps = {
    date: Date
    variant?: 'success' | 'warning' | 'info' | 'neutral' | 'danger'
    content?: ReactNode
    onShowContent?: () => void
    onHideContent?: () => void
} & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onFocus' | 'onBlur' | 'onMouseOver' | 'onMouseOut' | 'tabIndex' | 'content'
>

export const TimelineEvent: React.FC<TimelineEventProps> = ({
    date,
    variant = 'neutral',
    content,
    onShowContent,
    onHideContent,
    className,
    ...buttonProps
}) => {
    const timeline = useTimeline()

    const [show, setShow] = useState(false)
    const anchor = useRef<HTMLButtonElement>(null)

    const startPositionPercentage =
        ((date.getTime() - timeline.start.getTime()) / (timeline.end.getTime() - timeline.start.getTime())) * 100

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
            className={clsx(
                'absolute h-full min-w-[1%] rounded-sm -translate-x-[50%] border',
                variant === 'neutral' && 'border-(--ax-border-neutral) bg-(--ax-bg-neutral-moderate)',
                variant === 'success' && 'border-(--ax-border-success) bg-(--ax-bg-success-moderate)',
                variant === 'danger' && 'border-(--ax-border-danger) bg-(--ax-bg-danger-moderate)',
                variant === 'warning' && 'border-(--ax-border-warning) bg-(--ax-bg-warning-moderate)',
                variant === 'info' && 'border-(--ax-border-info) bg-(--ax-bg-info-moderate)',
                className
            )}
            style={{
                left: `${startPositionPercentage}%`,
            }}
            tabIndex={0}
            ref={anchor}
            onFocus={showContent}
            onBlur={hideContent}
            onMouseOver={showContent}
            onMouseOut={hideContent}
            {...buttonProps}
        >
            {!!content && (
                <Popover open={show} anchorEl={anchor.current} onClose={() => setShow(false)}>
                    <PopoverContent>{content}</PopoverContent>
                </Popover>
            )}
        </button>
    )
}
