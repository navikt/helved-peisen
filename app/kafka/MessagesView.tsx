'use client'

import { useEffect, useState } from 'react'
import { MessagesChart } from '@/app/kafka/chart/MessagesChart.tsx'
import {
    MessagesTable,
    MessagesTableSkeleton,
} from '@/app/kafka/table/MessagesTable.tsx'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { useSearchParams } from 'next/navigation'
import { Message, Topics, TopicName } from './types.ts'

export const MessagesView = () => {
    const params = useSearchParams()
    const [messages, setMessages] = useState<Record<string, Message[]>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fom = params.get('fom') ? new Date(params.get('fom')!) : undefined
        const tom = params.get('tom') ? new Date(params.get('tom')!) : undefined
        const rawTopics = params.get('topics')?.split(',')

        const topics: TopicName[] | undefined = rawTopics
            ? rawTopics.filter((t): t is TopicName =>
                Object.values(Topics).includes(t as TopicName)
            )
            : undefined;

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
