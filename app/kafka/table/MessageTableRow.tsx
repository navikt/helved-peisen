'use client'

import React, { useState } from 'react'
import { Message, TopicName } from '@/app/kafka/types.ts'
import { JsonView } from '@/components/JsonView.tsx'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import { formatDate } from 'date-fns'
import { XMLView } from '@/components/XMLView.tsx'
import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { UrlSearchParamLink } from '@/components/UrlSearchParamLink.tsx'

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

    return typeof data === 'string' ? (
        <XMLView data={data} />
    ) : (
        <JsonView json={data} />
    )
}

const RowContents: React.FC<Props> = ({ message }) => {
    const time = formatDate(message.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss')

    return (
        <>
            <TableDataCell>
                <TopicNameTag name={message.topic_name as TopicName} />
            </TableDataCell>
            <TableDataCell>
                <UrlSearchParamLink
                    searchParamName="key"
                    searchParamValue={message.key}
                >
                    {message.key}
                </UrlSearchParamLink>
            </TableDataCell>
            <TableDataCell>{time}</TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
        </>
    )
}

const ExpandableMessageTableRow: React.FC<Props> = ({ message }) => {
    const [open, setOpen] = useState(false)

    return (
        <TableExpandableRow
            open={open}
            onOpenChange={setOpen}
            content={open && <MessageTableRowContents message={message} />}
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
                <RowContents message={message} />
            </TableRow>
        )
    }
}
