'use client'

import React, { useState } from 'react'
import { Message, TopicName } from '@/app/kafka/types.ts'
import { JsonView } from '@/components/JsonView.tsx'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import { CopyButton, HStack, Label, VStack } from '@navikt/ds-react'
import { formatDate } from 'date-fns'

import { XMLView } from '@/components/XMLView.tsx'
import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { UrlSearchParamLink } from '@/components/UrlSearchParamLink.tsx'

import styles from './MessageTableRow.module.css'
import AddNewKvitteringButton from '@/app/kafka/AddNewKvitteringButton.tsx'

type Props = {
    message: Message
}

const MessageTableRowContents: React.FC<Props> = ({ message }) => {
    const data = (() => {
        try {
            return JSON.parse(message.value!)
        } catch {
            return message.value
        }
    })()

    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Key</Label>
                <HStack gap="space-8">
                    {message.key}
                    <CopyButton size="xsmall" copyText={message.key} />
                </HStack>
            </VStack>
            <VStack gap="space-4">
                <Label>Value</Label>
                {typeof data === 'string' ? (
                    <XMLView data={data} />
                ) : (
                    <JsonView json={data} />
                )}
            </VStack>
        </VStack>
    )
}

const RowContents: React.FC<Props> = ({ message }) => {
    const time = formatDate(message.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss')
    const containsRequiredXmlTags = (
        xmlContent: string | null | undefined
    ): boolean => {
        if (!xmlContent) return false

        return xmlContent.includes('<mmel>')
    }

    const showKvitteringButton =
        message.topic_name === 'helved.oppdrag.v1' &&
        containsRequiredXmlTags(message.value)

    return (
        <>
            <TableDataCell>
                <TopicNameTag name={message.topic_name as TopicName} />
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
                <HStack wrap={false} className={styles.buttons}>
                    {showKvitteringButton && (
                        <AddNewKvitteringButton message={message} />
                    )}
                </HStack>
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
