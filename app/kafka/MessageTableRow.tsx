import React from 'react'
import { Message } from '@/app/kafka/types'
import { JsonView } from '@/components/JsonView.tsx'
import {
    TableDataCell,
    TableExpandableRow,
    TableRow,
} from '@navikt/ds-react/Table'
import { formatDate } from 'date-fns'

type Props = {
    message: Message & {
        topic: string
    }
}

const MessageTableRowContents: React.FC<Props> = ({ message }) => {
    const data = (() => {
        try {
            return JSON.parse(message.data)
        } catch {
            return message.data
        }
    })()

    return <JsonView json={data} />
}

export const MessageTableRow: React.FC<Props> = ({ message }) => {
    const time = formatDate(message.timestamp, 'yyyy-MM-dd - HH:mm:ss')

    if (!message.data) {
        return (
            <TableRow>
                <TableDataCell />
                <TableDataCell>{message.key}</TableDataCell>
                <TableDataCell>{message.topic}</TableDataCell>
                <TableDataCell>{time}</TableDataCell>
            </TableRow>
        )
    }

    return (
        <TableExpandableRow
            content={<MessageTableRowContents message={message} />}
        >
            <TableDataCell>{message.key}</TableDataCell>
            <TableDataCell>{message.topic}</TableDataCell>
            <TableDataCell>{time}</TableDataCell>
        </TableExpandableRow>
    )
}
