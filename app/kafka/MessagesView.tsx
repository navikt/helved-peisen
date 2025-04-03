'use client'

import { useEffect, useState } from 'react'
import { MessagesChart } from '@/app/kafka/chart/MessagesChart.tsx'
import {
    MessagesTable,
    MessagesTableSkeleton,
} from '@/app/kafka/table/MessagesTable.tsx'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { useSearchParams } from 'next/navigation'
import { Message } from './types.ts'

export const MessagesView = () => {
    const searchParams = useSearchParams()
    const [messages, setMessages] = useState<Record<string, Message[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMessagesByTopic(searchParams.toString()).then((res) => {
            setMessages(res)
            setLoading(false)
        })
    }, [searchParams])

    if (loading) {
        return <MessagesTableSkeleton />
    }

    return (
        <>
            <MessagesChart messages={messages} />
            <MessagesTable messages={messages} />
        </>
    )
}
