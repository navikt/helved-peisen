'use client'

import { useContext, useEffect, useState } from 'react'
import { Alert } from '@navikt/ds-react'
import { useSearchParams } from 'next/navigation'

import { MessagesChart, MessagesChartSkeleton } from '@/app/kafka/chart/MessagesChart.tsx'
import { MessagesTable, MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { NoMessages } from '@/app/kafka/NoMessages.tsx'
import { parsedXML } from '@/lib/xml.ts'
import { FiltereContext } from '@/app/kafka/Filtere.tsx'
import { SortStateContext } from '@/app/kafka/table/SortState.tsx'
import { type Message } from './types.ts'

const latestMessages = (messages: Message[]) => {
    const grouped = new Map<string, Message>()
    messages.forEach((message) => {
        const key = `${message.topic_name}:${message.key}`
        const existing = grouped.get(key)
        if (!existing || message.timestamp_ms > existing.timestamp_ms) {
            grouped.set(key, message)
        }
    })
    return Array.from(grouped.values())
}

export const MessagesView = () => {
    const searchParams = useSearchParams()
    const [messages, setMessages] = useState<ApiResponse<Record<string, Message[]>> | null>(null)
    const [loading, setLoading] = useState(true)
    const sortState = useContext(SortStateContext)
    const filtere = useContext(FiltereContext)

    useEffect(() => {
        if (searchParams.get('fom') && searchParams.get('tom')) {
            setLoading(true)
            getMessagesByTopic(searchParams.toString()).then((res) => {
                setMessages(res)
                setLoading(false)
            })
        }
    }, [searchParams])

    if (!messages || loading) {
        return (
            <>
                <MessagesChartSkeleton />
                <MessagesTableSkeleton />
            </>
        )
    }

    if (messages.error) {
        return (
            <Alert variant="error" role="alert">
                {messages.error.message}
            </Alert>
        )
    }

    if (Object.values(messages.data).flat().length === 0) {
        return <NoMessages />
    }

    let filteredMessages = Object.values(messages.data).flat()

    if (filtere.visning === 'siste' || filtere.utenKvittering) {
        filteredMessages = latestMessages(filteredMessages)
    }

    if (filtere.utenKvittering) {
        filteredMessages = filteredMessages.filter((m) => {
            if (!m.value || m.topic_name !== 'helved.oppdrag.v1') return false
            const doc = parsedXML(m.value)
            const alvorlighetsgrad = doc.querySelector('mmel > alvorlighetsgrad')?.textContent
            return !alvorlighetsgrad
        })
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

    return (
        <>
            <MessagesChart messages={filteredMessages} />
            <MessagesTable messages={filteredMessages} />
        </>
    )
}
