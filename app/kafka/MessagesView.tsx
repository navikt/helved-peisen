'use client'

import { useContext } from 'react'
import { Alert } from '@navikt/ds-react'

import { MessagesTable, MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { NoMessages } from '@/components/NoMessages.tsx'
import { MessagesContext } from './context/MessagesContext.tsx'
import { isFailureResponse } from '@/lib/api/types.ts'

export const MessagesView = () => {
    const { messages } = useContext(MessagesContext)

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
        return <NoMessages title="Fant ingen meldinger" />
    }

    let filteredMessages = messages.data.items

    return <MessagesTable messages={filteredMessages} totalMessages={messages.data.total} />
}
