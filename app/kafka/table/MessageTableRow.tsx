'use client'

import React, { useState } from 'react'
import { Message } from '@/app/kafka/types.ts'
import { JsonView } from '@/components/JsonView.tsx'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import { formatDate } from 'date-fns'
import { XMLView } from '@/components/XMLView.tsx'

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

    return typeof data === 'string'
        ? <XMLView data={data} />
        : <JsonView json={data} />
}

const ExpandableMessageTableRow: React.FC<Props> = ({ message }) => {
    const time = formatDate(message.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss')
    const [open, setOpen] = useState(false)

    return (
        <TableExpandableRow
            open={open}
            onOpenChange={setOpen}
            content={open && <MessageTableRowContents message={message} />}
        >
            <TableDataCell>{message.topic_name}</TableDataCell>
            <TableDataCell>{message.key}</TableDataCell>
            <TableDataCell>{time}</TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
        </TableExpandableRow>
    )
}

export const MessageTableRow: React.FC<Props> = ({ message }) => {
    if (message.value) {
        return <ExpandableMessageTableRow message={message} />
    }

    const time = formatDate(message.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss')

    if (!message.value) {
        return (
            <TableRow>
                <TableDataCell />
                <TableDataCell>{message.topic_name}</TableDataCell>
                <TableDataCell>{message.key}</TableDataCell>
                <TableDataCell>{time}</TableDataCell>
                <TableDataCell>{message.partition}</TableDataCell>
                <TableDataCell>{message.offset}</TableDataCell>
            </TableRow>
        )
    }
}
