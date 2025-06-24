'use client'

import React, { useState } from 'react'
import { Message } from '@/app/kafka/types.ts'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import { CopyButton, HStack, Label, VStack } from '@navikt/ds-react'
import { formatDate } from 'date-fns'
import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { UrlSearchParamLink } from '@/components/UrlSearchParamLink.tsx'
import { AddKvitteringButton } from '@/app/kafka/table/AddKvitteringButton.tsx'
import { MessageMetadata } from '@/app/kafka/table/MessageMetadata.tsx'

import styles from './MessageTableRow.module.css'
import { MessageValue } from './MessageValue'

type Props = {
    message: Message
}

const MessageTableRowContents: React.FC<Props> = ({ message }) => {
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
    const time = formatDate(message.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')

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
            <TableDataCell>{time}</TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
            <TableDataCell>
                {message.topic_name === 'helved.oppdrag.v1' &&
                    message.value && (
                        <AddKvitteringButton
                            messageValue={message.value}
                            messageKey={message.key}
                        />
                    )}
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
