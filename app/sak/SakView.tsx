'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { BodyShort, Box, HStack, Label, Skeleton, Switch, ToggleGroup, VStack } from '@navikt/ds-react'
import { Message } from '@/app/kafka/types.ts'
import { useSak } from './SakProvider'
import { Timeline, TimelineEvent, TimelineRow } from './timeline'
import { SakTable, SakTableSkeleton } from './table/SakTable'
import { TimelineRowSkeleton } from './timeline/TimelineRow'
import { TimelineSkeleton } from './timeline/Timeline'
import { ToggleGroupItem } from '@navikt/ds-react/ToggleGroup'
import { keepLatest } from '@/lib/message'

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
        case 'HELSREF':
            return 'Historisk'
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
    const [visning, setVisning] = useState<'alle' | 'siste'>('alle')
    const [activeMessage, setActiveMessage] = useState<Message | null>()

    const messages = useMemo(() => {
        if (!sak || sak.hendelser.length === 0) return []

        const messages = hideDuplicates ? removeDuplicateMessages(sak.hendelser) : sak.hendelser

        return visning === 'alle' ? messages : keepLatest(messages)
    }, [sak, visning, hideDuplicates])

    if (isLoading) {
        return <SakViewSkeleton />
    }

    if (!sak || sak.hendelser.length === 0) {
        return null
    }

    return (
        <VStack gap="space-32">
            <HStack gap="space-24">
                <Box padding="space-16" background="neutral-soft" borderRadius="8">
                    <VStack gap="space-12">
                        <Label>Sak-ID</Label>
                        <BodyShort>{sak.id}</BodyShort>
                    </VStack>
                </Box>
                <Box padding="space-16" background="neutral-soft" borderRadius="8">
                    <VStack gap="space-12">
                        <Label>Fagsystem</Label>
                        <BodyShort>{fagsystem(sak.fagsystem)}</BodyShort>
                    </VStack>
                </Box>
            </HStack>
            <VStack gap="space-12">
                <Label>Tidslinje</Label>
                <Box padding="space-16" background="neutral-soft" borderRadius="8">
                    <Timeline>
                        {Object.entries(groupHendelserOnTopic(messages)).map(([topic, messages]) => (
                            <TimelineRow key={topic} label={topic}>
                                {messages.map((it, i) => (
                                    <TimelineEvent
                                        key={i}
                                        date={new Date(it.system_time_ms)}
                                        variant="info"
                                        content={
                                            <div className="grid grid-cols-[auto_auto] min-w-max gap-4 text-start">
                                                <div>Key:</div>
                                                <div>{it.key}</div>
                                                <div>Timestamp:</div>
                                                <div>{it.system_time_ms}</div>
                                            </div>
                                        }
                                        onClick={() => setActiveMessage(it)}
                                    />
                                ))}
                            </TimelineRow>
                        ))}
                    </Timeline>
                </Box>
            </VStack>
            <VStack gap="space-12">
                <HStack gap="space-16" justify="space-between">
                    <Label>Hendelser</Label>
                    <HStack gap="space-16">
                        <ToggleGroup
                            defaultValue="Alle"
                            size="small"
                            onChange={(value: string) => setVisning(value as 'alle' | 'siste')}
                            value={visning}
                        >
                            <ToggleGroupItem value="alle" label="Alle" />
                            <ToggleGroupItem value="siste" label="Siste" />
                        </ToggleGroup>
                        <Switch
                            size="small"
                            checked={hideDuplicates}
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                setHideDuplicates(event.target.checked)
                            }}
                        >
                            Skjul duplikater
                        </Switch>
                    </HStack>
                </HStack>
                <Box
                    borderRadius="8"
                    background="neutral-soft"
                    padding="space-16"
                    className="max-w-[100vw] flex overflow-x-auto scrollbar-gutter-stable"
                >
                    <SakTable messages={messages} activeMessage={activeMessage} />
                </Box>
            </VStack>
        </VStack>
    )
}

export const SakViewSkeleton = () => {
    return (
        <VStack gap="space-32" className="animate-fade-in">
            <HStack gap="space-24">
                <Box padding="space-16" background="neutral-soft" borderRadius="8">
                    <VStack gap="space-12">
                        <Label>Sak-ID</Label>
                        <Skeleton width="100%" />
                    </VStack>
                </Box>
                <Box padding="space-16" background="neutral-soft" borderRadius="8">
                    <VStack gap="space-12">
                        <Label>Fagsystem</Label>
                        <Skeleton width="100%" />
                    </VStack>
                </Box>
            </HStack>
            <VStack gap="space-12">
                <Label>Tidslinje</Label>
                <Box padding="space-16" background="neutral-soft" borderRadius="8">
                    <TimelineSkeleton>
                        {new Array(3).fill(null).map((_, i) => (
                            <TimelineRowSkeleton key={i} />
                        ))}
                    </TimelineSkeleton>
                </Box>
            </VStack>
            <VStack gap="space-12">
                <HStack gap="space-16" justify="space-between">
                    <Label>Hendelser</Label>
                    <HStack gap="space-16">
                        <ToggleGroup defaultValue="Alle" size="small" onChange={() => null}>
                            <ToggleGroupItem value="alle" label="Alle" />
                            <ToggleGroupItem value="siste" label="Siste" />
                        </ToggleGroup>
                        <Switch size="small">Skjul duplikater</Switch>
                    </HStack>
                </HStack>
                <Box
                    borderRadius="8"
                    background="neutral-soft"
                    padding="space-16"
                    className="max-w-[100vw] flex overflow-x-auto scrollbar-gutter-stable"
                >
                    <SakTableSkeleton />
                </Box>
            </VStack>
        </VStack>
    )
}
