'use client'

import { useEffect, useState } from 'react'
import { MessagesChart } from '@/app/kafka/chart/MessagesChart.tsx'
import {
    MessagesTable,
    MessagesTableSkeleton,
} from '@/app/kafka/table/MessagesTable.tsx'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { useSearchParams } from 'next/navigation'
import { Message } from './types'

export const MessagesView = () => {
    const params = useSearchParams()
    const [messages, setMessages] = useState<Record<string, Message[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fom = params.get('fom') ? new Date(params.get('fom')!) : undefined
        const tom = params.get('tom') ? new Date(params.get('tom')!) : undefined
        const topics = params.get('topics')?.split(',')

        getMessagesByTopic(fom, tom, topics).then((res) => {
            setMessages(res)
            setLoading(false)
        })
    }, [params])

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
