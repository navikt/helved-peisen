'use server'

import { Message, TopicName, Topics } from '@/app/kafka/types.ts'
import { fetchMessages } from '@/lib/api/kafka.ts'
import { ReadonlyURLSearchParams } from 'next/navigation'

export const getMessagesByTopic = async (
    params: string
): Promise<ApiResponse<Record<TopicName, Message[]>>> => {
    const searchParams = new ReadonlyURLSearchParams(params)

    const messages = await fetchMessages(searchParams)

    if (messages.error) {
        return messages
    }

    const entries = Object.values(Topics).map((topic) => [
        topic,
        messages.data.filter((message) => topic === message.topic_name),
    ])

    return { data: Object.fromEntries(entries), error: null }
}
