'use client'

import { useContext } from 'react'
import { Alert } from '@navikt/ds-react'

import { MessagesTable, MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { NoMessages } from '@/app/kafka/NoMessages.tsx'
import { FiltereContext } from '@/app/kafka/Filtere.tsx'
import { SortStateContext } from '@/app/kafka/table/SortState.tsx'
import { keepLatest } from '@/lib/message.ts'
import { MessagesContext } from './context/MessagesContext.tsx'
import { isFailureResponse } from '@/lib/api/types.ts'

export const MessagesView = () => {
    const { messages } = useContext(MessagesContext)
    const sortState = useContext(SortStateContext)
    const filtere = useContext(FiltereContext)

    if (!messages) {
        return <MessagesTableSkeleton />
    }

    if (isFailureResponse(messages)) {
        return (
            <Alert variant="error" role="alert">
                {messages.error}
            </Alert>
        )
    }

    if (messages.data.items.length === 0) {
        return <NoMessages />
    }

    let filteredMessages = messages.data.items

    if (filtere.visning === 'siste' || filtere.utenKvittering) {
        filteredMessages = keepLatest(filteredMessages)
    }

    if (filtere.utenKvittering) {
        filteredMessages = filteredMessages
            // Velger ut alle oppdrag uten status
            .filter((message) => message.topic_name === 'helved.oppdrag.v1' && !message.status)
            // Sjekker at det ikke finnes flere oppdrag med samme key og satt status
            .filter((message, _, messages) => !messages.find((it) => it.key === message.key && !!it.status))
    }

    filteredMessages = filteredMessages.slice(0).sort((a, b) =>
        sortState.direction === 'ascending'
            ? // @ts-ignore
              +a[sortState.orderBy]! - +b[sortState.orderBy]!
            : sortState.direction === 'none'
              ? 0
              : // @ts-ignore
                +b[sortState.orderBy]! - +a[sortState.orderBy]!
    )

    return <MessagesTable messages={filteredMessages} totalMessages={messages.data.total} />
}
