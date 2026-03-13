import React from 'react'
import { Message } from '@/app/kafka/types'
import { Skeleton, Timeline, VStack } from '@navikt/ds-react'
import { TimelinePeriod, TimelineRow } from '@navikt/ds-react/Timeline'
import { endOfDay, format, startOfDay } from 'date-fns'

type GroupedMessages = {
    [topic: string]: {
        [date: string]: Message[]
    }
}

const groupedByTopic = (messages: Message[]): GroupedMessages => {
    const groups: GroupedMessages = {}

    for (const message of messages) {
        if (!groups[message.topic_name]) {
            groups[message.topic_name] = {}
        }
        const date = format(message.system_time_ms, 'yyyy-MM-dd')
        if (!groups[message.topic_name][date]) {
            groups[message.topic_name][date] = [message]
        } else {
            groups[message.topic_name][date].push(message)
        }
    }

    return groups
}

type Props = {
    messages: Message[]
    onSelect: (messages: Message[]) => void
}

export const SakTimeline: React.FC<Props> = React.memo(({ messages, onSelect }) => {
    if (messages.length === 0) {
        return null
    }

    const groups = groupedByTopic(messages)

    return (
        <Timeline>
            {Object.entries(groups).map(([topic, groups]) => (
                <TimelineRow key={topic} label={topic}>
                    {Object.entries(groups).map(([date, messages]) => (
                        <TimelinePeriod
                            key={date}
                            start={startOfDay(date)}
                            end={endOfDay(date)}
                            status="info"
                            onSelectPeriod={() => onSelect(messages)}
                        >
                            {messages.length} meldinger
                        </TimelinePeriod>
                    ))}
                </TimelineRow>
            ))}
        </Timeline>
    )
})

export const SakTimelineSkeleton = () => {
    return (
        <VStack className="grid grid-cols-[auto_minmax(0,1fr)] items-center w-full min-w-fit relative">
            <div className="min-w-50 mr-4">
                <Skeleton />
            </div>
            <div className="my-4 min-h-4">
                <Skeleton />
            </div>
            <div className="min-w-50 mr-4">
                <Skeleton />
            </div>
            <div className="my-4 min-h-4">
                <Skeleton />
            </div>
            <div className="min-w-50 mr-4">
                <Skeleton />
            </div>
            <div className="my-4 min-h-4">
                <Skeleton />
            </div>
        </VStack>
    )
}
