'use client'

import React, { useState } from 'react'
import { Message } from '@/app/kafka/types.ts'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import {
    ActionMenu,
    Button,
    CopyButton,
    HStack,
    Label,
    VStack,
} from '@navikt/ds-react'
import {
    ActionMenuContent,
    ActionMenuTrigger,
} from '@navikt/ds-react/ActionMenu'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { formatDate } from 'date-fns'
import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { UrlSearchParamLink } from '@/components/UrlSearchParamLink.tsx'
import { AddKvitteringButton } from '@/app/kafka/table/AddKvitteringButton.tsx'
import { MessageMetadata } from '@/app/kafka/table/MessageMetadata.tsx'
import { MessageValue } from './MessageValue'

import styles from './MessageTableRow.module.css'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'

type Props = {
    message: Message
}

export const MessageTableRowContents: React.FC<Props> = ({ message }) => {
    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Key</Label>
                <HStack gap="space-8">
                    {message.key}
                    <CopyButton size="xsmall" copyText={message.key} />
                </HStack>
            </VStack>
            <MessageMetadata message={message} />
            <MessageValue message={message} />
        </VStack>
    )
}

const RowContents: React.FC<Props> = ({ message }) => {
    return (
        <>
            <TableDataCell>
                <TopicNameTag message={message} />
            </TableDataCell>
            <TableDataCell>
                <UrlSearchParamLink
                    searchParamName="key"
                    searchParamValue={message.key}
                    className={styles.keyLink}
                >
                    {message.key}
                </UrlSearchParamLink>
            </TableDataCell>
            <TableDataCell>
                {formatDate(message.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
            </TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
            <TableDataCell>
                {message.topic_name === 'helved.oppdrag.v1' &&
                    message.value && (
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
                                <AddKvitteringButton
                                    messageValue={message.value}
                                    messageKey={message.key}
                                />
                            </ActionMenuContent>
                        </ActionMenu>
                    )}
            </TableDataCell>
            <TableDataCell>
                <GrafanaTraceLink traceId={message.trace_id} />
            </TableDataCell>
        </>
    )
}

const ExpandableMessageTableRow: React.FC<Props> = ({ message }) => {
    const [open, setOpen] = useState(false)
    const [didOpen, setDidOpen] = useState(false)

    const toggleOpen = (open: boolean) => {
        if (!didOpen) {
            setDidOpen(true)
        }
        setOpen(open)
    }

    return (
        <TableExpandableRow
            open={open}
            onOpenChange={toggleOpen}
            content={didOpen && <MessageTableRowContents message={message} />}
        >
            <RowContents message={message} />
        </TableExpandableRow>
    )
}

export const MessageTableRow: React.FC<Props> = ({ message }) => {
    if (message.value) {
        return <ExpandableMessageTableRow message={message} />
    }

    if (!message.value) {
        return (
            <TableRow>
                <TableDataCell />
                <RowContents message={message} />
            </TableRow>
        )
    }
}
