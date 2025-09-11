'use client'

import React, { useState } from 'react'
import { BodyShort, BoxNew, HStack, Label, Skeleton, Switch, VStack } from '@navikt/ds-react'
import { Message } from '@/app/kafka/types.ts'
import { useSak } from './SakProvider'
import { Timeline, TimelineEvent, TimelineRow } from './timeline'
import { SakTable, SakTableSkeleton } from './table/SakTable'
import { TimelineRowSkeleton } from './timeline/TimelineRow'
import { TimelineSkeleton } from './timeline/Timeline'

import fadeIn from '@/styles/fadeIn.module.css'
import styles from './SakView.module.css'

const fagsystem = (fagsystem: string) => {
    switch (fagsystem) {
        case 'TILLST':
            return 'Tilleggsstønader'
        case 'TILTPENG':
            return 'Tiltakspenger'
        case 'DP':
            return 'Dagpenger'
        case 'AAP':
            return 'AAP'
        default:
            return fagsystem
    }
}

const removeDuplicateMessages = (messages: Message[]) => {
    const messageMap: Record<string, Message> = {}

    for (const message of messages) {
        const key = JSON.stringify({
            ...message,
            offset: null, // Offset vil alltid være forskjellig
            system_time_ms: null, // Bryr oss ikke om denne
            stream_time_ms: null, // eller denne,
            trace_id: null, // eller denne,
        })
        messageMap[key] = message
    }

    return Object.values(messageMap)
}

const groupHendelserOnTopic = (hendelser: Message[]): Record<string, Message[]> => {
    return hendelser.reduce(
        (grouped, hendelse) => {
            if (!grouped[hendelse.topic_name]) {
                grouped[hendelse.topic_name] = [hendelse]
            } else {
                grouped[hendelse.topic_name].push(hendelse)
            }
            return grouped
        },
        {} as Record<string, Message[]>
    )
}

export const SakView = () => {
    const { sak, isLoading } = useSak()
    const [hideDuplicates, setHideDuplicates] = useState(true)
    const [activeMessage, setActiveMessage] = useState<Message | null>()

    if (isLoading) {
        return <SakViewSkeleton />
    }

    if (!sak || sak.hendelser.length === 0) {
        return null
    }

    const messages = hideDuplicates ? removeDuplicateMessages(sak.hendelser) : sak.hendelser

    return (
        <VStack gap="space-32">
            <HStack gap="space-24">
                <BoxNew padding="4" background="neutral-soft" borderRadius="large">
                    <VStack gap="space-12">
                        <Label>Sak-ID</Label>
                        <BodyShort>{sak.id}</BodyShort>
                    </VStack>
                </BoxNew>
                <BoxNew padding="4" background="neutral-soft" borderRadius="large">
                    <VStack gap="space-12">
                        <Label>Fagsystem</Label>
                        <BodyShort>{fagsystem(sak.fagsystem)}</BodyShort>
                    </VStack>
                </BoxNew>
            </HStack>
            <VStack gap="space-12">
                <Label>Tidslinje</Label>
                <BoxNew padding="4" background="neutral-soft" borderRadius="large">
                    <Timeline>
                        {Object.entries(groupHendelserOnTopic(messages)).map(([topic, messages]) => (
                            <TimelineRow key={topic} label={topic}>
                                {messages.map((it, i) => (
                                    <TimelineEvent
                                        key={i}
                                        date={new Date(it.timestamp_ms)}
                                        variant="info"
                                        content={
                                            <div className={styles.periodContent}>
                                                <div>Key:</div>
                                                <div>{it.key}</div>
                                                <div>Timestamp:</div>
                                                <div>{it.timestamp_ms}</div>
                                            </div>
                                        }
                                        onClick={() => setActiveMessage(it)}
                                        // onShowContent={() => setActiveMessage(it)}
                                        // onHideContent={() => setActiveMessage(null)}
                                    />
                                ))}
                            </TimelineRow>
                        ))}
                    </Timeline>
                </BoxNew>
            </VStack>
            <VStack gap="space-12">
                <HStack gap="space-16" justify="space-between">
                    <Label>Hendelser</Label>
                    <Switch
                        size="small"
                        checked={hideDuplicates}
                        onChange={(event) => {
                            setHideDuplicates(event.target.checked)
                        }}
                    >
                        Skjul duplikater
                    </Switch>
                </HStack>
                <BoxNew borderRadius="large" background="neutral-soft" padding="4" className={styles.tableContainer}>
                    <SakTable messages={messages} activeMessage={activeMessage} />
                </BoxNew>
            </VStack>
        </VStack>
    )
}

export const SakViewSkeleton = () => {
    return (
        <VStack gap="space-32" className={fadeIn.animation}>
            <HStack gap="space-24">
                <BoxNew padding="4" background="neutral-soft" borderRadius="large">
                    <VStack gap="space-12">
                        <Label>Sak-ID</Label>
                        <Skeleton width="100%" />
                    </VStack>
                </BoxNew>
                <BoxNew padding="4" background="neutral-soft" borderRadius="large">
                    <VStack gap="space-12">
                        <Label>Fagsystem</Label>
                        <Skeleton width="100%" />
                    </VStack>
                </BoxNew>
            </HStack>
            <VStack gap="space-12">
                <Label>Tidslinje</Label>
                <BoxNew padding="4" background="neutral-soft" borderRadius="large">
                    <TimelineSkeleton>
                        {new Array(3).fill(null).map((_, i) => (
                            <TimelineRowSkeleton key={i} />
                        ))}
                    </TimelineSkeleton>
                </BoxNew>
            </VStack>
            <VStack gap="space-12">
                <HStack gap="space-16" justify="space-between">
                    <Label>Hendelser</Label>
                    <Switch size="small">Skjul duplikater</Switch>
                </HStack>
                <BoxNew borderRadius="large" background="neutral-soft" padding="4" className={styles.tableContainer}>
                    <SakTableSkeleton />
                </BoxNew>
            </VStack>
        </VStack>
    )
}
