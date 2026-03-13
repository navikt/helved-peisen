'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { BodyShort, HStack, Skeleton, Switch, ToggleGroup, VStack } from '@navikt/ds-react'
import { Message } from '@/app/kafka/types.ts'
import { useSak } from './SakProvider'
import { SakTable, SakTableSkeleton } from './table/SakTable'
import { ToggleGroupItem } from '@navikt/ds-react/ToggleGroup'
import { keepLatest } from '@/lib/message'
import { NoMessages } from '@/components/NoMessages'
import { Card } from '@/components/Card'
import { SakTimeline, SakTimelineSkeleton } from '@/app/sak/SakTimeline.tsx'

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

    const sorted = [...messages].sort((a, b) => b.system_time_ms - a.system_time_ms) // nyeste først

    for (const message of sorted) {
        const key = JSON.stringify({
            ...message,
            offset: null, // Offset vil alltid være forskjellig
            system_time_ms: null, // Bryr oss ikke om denne
            stream_time_ms: null, // eller denne,
            trace_id: null, // eller denne,
        })
        if (!messageMap[key]) {
            messageMap[key] = message
        }
    }

    return Object.values(messageMap)
}

export const SakView = () => {
    const { sak, isLoading, didSearch } = useSak()
    const [hideDuplicates, setHideDuplicates] = useState(true)
    const [visning, setVisning] = useState<'alle' | 'siste'>('alle')
    const [active, setActive] = useState<Message[]>([])

    const messages = useMemo(() => {
        if (!sak || sak.hendelser.length === 0) return []

        const messages = hideDuplicates ? removeDuplicateMessages(sak.hendelser) : sak.hendelser

        return visning === 'alle' ? messages : keepLatest(messages)
    }, [sak, visning, hideDuplicates])

    if (isLoading) {
        return <SakViewSkeleton />
    }

    if (didSearch && messages.length === 0) {
        return <NoMessages title="Fant ingen sak" />
    }

    if (!sak || sak.hendelser.length === 0) {
        return null
    }

    return (
        <VStack gap="space-32">
            <HStack gap="space-24">
                <Card label="Sak-ID">
                    <BodyShort>{sak.id}</BodyShort>
                </Card>
                <Card label="Fagsystem">
                    <BodyShort>{fagsystem(sak.fagsystem)}</BodyShort>
                </Card>
            </HStack>
            <SakTimeline messages={sak.hendelser} onSelect={setActive} />
            <VStack gap="space-12">
                <HStack justify="end" gap="space-16">
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
                <SakTable messages={messages} active={active} />
            </VStack>
        </VStack>
    )
}

export const SakViewSkeleton = () => {
    return (
        <VStack gap="space-32" className="animate-fade-in">
            <HStack gap="space-24">
                <Card label="Sak-ID">
                    <Skeleton width="100%" />
                </Card>
                <Card label="Fagsystem">
                    <Skeleton width="100%" />
                </Card>
            </HStack>
            <SakTimelineSkeleton />
            <VStack gap="space-12">
                <HStack gap="space-16" justify="end">
                    <HStack gap="space-16">
                        <ToggleGroup defaultValue="Alle" size="small" onChange={() => null}>
                            <ToggleGroupItem value="alle" label="Alle" />
                            <ToggleGroupItem value="siste" label="Siste" />
                        </ToggleGroup>
                        <Switch size="small">Skjul duplikater</Switch>
                    </HStack>
                </HStack>
                <SakTableSkeleton />
            </VStack>
        </VStack>
    )
}
