'use client'

import { useContext } from 'react'
import { Alert } from '@navikt/ds-react'

import { MessagesTable, MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { NoMessages } from '@/components/NoMessages.tsx'
import { MessagesContext } from './MessagesContext.tsx'
import { isFailureResponse } from '@/lib/api/types.ts'
import { useFiltere } from '@/app/kafka/Filtere.tsx'

export const MessagesView = () => {
    const { loading, messages } = useContext(MessagesContext)
    const { pendingMismatch } = useFiltere()

    if (!messages || loading) {
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

    let filteredMessages = pendingMismatch
        ? messages.data.items.filter((m) => m.pendingMismatch)
        : messages.data.items

    return <MessagesTable messages={filteredMessages} totalMessages={messages.data.total} />
}
