import React from 'react'
import { Message } from '@/app/kafka/types.ts'
import { JsonView } from '@/components/JsonView.tsx'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import { formatDate } from 'date-fns'

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

    return <JsonView json={data} />
}

export const MessageTableRow: React.FC<Props> = ({ message }) => {
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

    return (
        <TableExpandableRow
            content={<MessageTableRowContents message={message} />}
        >
            <TableDataCell>{message.topic_name}</TableDataCell>
            <TableDataCell>{message.key}</TableDataCell>
            <TableDataCell>{time}</TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
        </TableExpandableRow>
    )
}
