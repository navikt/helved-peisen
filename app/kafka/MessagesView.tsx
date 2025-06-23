'use client'

import { useEffect, useState } from 'react'
import { Alert } from '@navikt/ds-react'
import { useSearchParams } from 'next/navigation'

import {
    MessagesChart,
    MessagesChartSkeleton,
} from '@/app/kafka/chart/MessagesChart.tsx'
import {
    MessagesTable,
    MessagesTableSkeleton,
} from '@/app/kafka/table/MessagesTable.tsx'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { NoMessages } from '@/app/kafka/NoMessages.tsx'
import { Message } from './types.ts'

export const MessagesView = () => {
    const searchParams = useSearchParams()
    const [messages, setMessages] = useState<ApiResponse<
        Record<string, Message[]>
    > | null>(null)
    const [loading, setLoading] = useState(true)

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

    return (
        <>
            <MessagesChart messages={messages.data} />
            <MessagesTable messages={messages.data} />
        </>
    )
}
