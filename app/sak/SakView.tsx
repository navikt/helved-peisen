'use client'

import React, { useState } from 'react'
import {
    ActionMenu,
    BodyShort,
    BoxNew,
    Button,
    HStack,
    Label,
    Switch,
    VStack,
} from '@navikt/ds-react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { format } from 'date-fns/format'
import clsx from 'clsx'

import { TopicNameTag } from '../kafka/table/TopicNameTag'
import { MessageTableRowContents } from '@/app/kafka/table/MessageTableRow.tsx'
import { Message } from '@/app/kafka/types.ts'
import { useSak } from './SakProvider'
import { Timeline, TimelinePeriod, TimelineRow } from './timeline'
import {
    ActionMenuContent,
    ActionMenuItem,
    ActionMenuTrigger,
} from '@navikt/ds-react/ActionMenu'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'

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

const groupHendelserOnTopic = (
    hendelser: Message[]
): Record<string, Message[]> => {
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
    const { sak } = useSak()
    const [hideDuplicates, setHideDuplicates] = useState(true)
    const [activeMessage, setActiveMessage] = useState<Message | null>()

    if (!sak || sak.hendelser.length === 0) {
        return null
    }

    const messages = hideDuplicates
        ? removeDuplicateMessages(sak.hendelser)
        : sak.hendelser

    return (
        <VStack gap="space-32" className={fadeIn.animation}>
            <HStack gap="space-24">
                <BoxNew
                    padding="4"
                    background="neutral-soft"
                    borderRadius="large"
                >
                    <VStack gap="space-12">
                        <Label>Sak-ID</Label>
                        <BodyShort>{sak.id}</BodyShort>
                    </VStack>
                </BoxNew>
                <BoxNew
                    padding="4"
                    background="neutral-soft"
                    borderRadius="large"
                >
                    <VStack gap="space-12">
                        <Label>Fagsystem</Label>
                        <BodyShort>{fagsystem(sak.fagsystem)}</BodyShort>
                    </VStack>
                </BoxNew>
            </HStack>
            <VStack gap="space-12">
                <Label>Tidslinje</Label>
                <BoxNew
                    padding="4"
                    background="neutral-soft"
                    borderRadius="large"
                >
                    <Timeline>
                        {Object.entries(groupHendelserOnTopic(messages)).map(
                            ([topic, messages]) => (
                                <TimelineRow key={topic} label={topic}>
                                    {messages.map((it, i) => (
                                        <TimelinePeriod
                                            key={i}
                                            date={new Date(it.timestamp_ms)}
                                            variant="info"
                                            content={
                                                <div
                                                    className={
                                                        styles.periodContent
                                                    }
                                                >
                                                    <div>Key:</div>
                                                    <div>{it.key}</div>
                                                    <div>Timestamp:</div>
                                                    <div>{it.timestamp_ms}</div>
                                                </div>
                                            }
                                            onShowContent={() =>
                                                setActiveMessage(it)
                                            }
                                            onHideContent={() =>
                                                setActiveMessage(null)
                                            }
                                        />
                                    ))}
                                </TimelineRow>
                            )
                        )}
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
                <BoxNew
                    borderRadius="large"
                    background="neutral-soft"
                    padding="4"
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell />
                                <TableHeaderCell textSize="small">
                                    Topic
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Timestamp
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Key
                                </TableHeaderCell>
                                <TableHeaderCell />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messages.map((it, i) => (
                                <TableExpandableRow
                                    key={it.key + it.timestamp_ms + i}
                                    className={clsx(
                                        activeMessage === it && styles.active
                                    )}
                                    content={
                                        <MessageTableRowContents message={it} />
                                    }
                                >
                                    <TableDataCell>
                                        <TopicNameTag message={it} />
                                    </TableDataCell>
                                    <TableDataCell className={styles.cell}>
                                        {format(
                                            it.timestamp_ms,
                                            'yyyy-MM-dd - HH:mm:ss.SSS'
                                        )}
                                    </TableDataCell>
                                    <TableDataCell>{it.key}</TableDataCell>

                                    <TableDataCell>
                                        {it.value && (
                                            <ActionMenu>
                                                <ActionMenuTrigger>
                                                    <Button
                                                        variant="tertiary-neutral"
                                                        size="small"
                                                        icon={
                                                            <MenuElipsisVerticalIcon title="Kontekstmeny" />
                                                        }
                                                    />
                                                </ActionMenuTrigger>
                                                <ActionMenuContent>
                                                    <ActionMenuItem>
                                                        <GrafanaTraceLink
                                                            traceId={
                                                                it.trace_id
                                                            }
                                                        />
                                                    </ActionMenuItem>
                                                </ActionMenuContent>
                                            </ActionMenu>
                                        )}
                                    </TableDataCell>
                                </TableExpandableRow>
                            ))}
                        </TableBody>
                    </Table>
                </BoxNew>
            </VStack>
        </VStack>
    )
}
