'use client'

import { useContext } from 'react'
import { Alert } from '@navikt/ds-react'

import { AuditTable, AuditTableSkeleton } from '@/app/audit/table/AuditTable.tsx'
import { NoMessages } from '@/components/NoMessages.tsx'
import { AuditMessagesContext } from '@/app/audit/AuditMessagesContext.tsx'
import { isFailureResponse } from '@/lib/api/types.ts'
import { headerValue } from '@/lib/message-header.ts'
import type { Message } from '@/app/kafka/types.ts'
import { useAuditSearch } from '@/app/audit/AuditFiltere.tsx'

// Fritekstsøket er kun klientside
function matchesSearch(message: Message, terms: string[]): boolean {
    if (terms.length === 0) return true

    const haystacks = [message.sakId, headerValue(message, 'endret-av'), headerValue(message, 'endret-aarsak')]

    return terms.some((term) => {
        const needle = term.toLowerCase()
        return haystacks.some((value) => value?.toLowerCase().includes(needle))
    })
}

export const AuditView = () => {
    const { loading, messages } = useContext(AuditMessagesContext)
    const { terms } = useAuditSearch()

    if (!messages || loading) {
        return <AuditTableSkeleton />
    }

    if (isFailureResponse(messages)) {
        return (
            <Alert variant="error" role="alert">
                {messages.error}
            </Alert>
        )
    }

    if (messages.data.items.length === 0) {
        return <NoMessages title="Fant ingen manuelt endrede meldinger" />
    }

    const filteredMessages = messages.data.items.filter((message) => matchesSearch(message, terms))

    if (filteredMessages.length === 0) {
        return <NoMessages title="Fant ingen manuelt endrede meldinger som matcher søket" />
    }

    return <AuditTable messages={filteredMessages} totalMessages={messages.data.total} />
}
