'use server'

import { Message, TopicName, Topics } from '@/app/kafka/types.ts'
import { fetchMessages } from '@/lib/api/kafka.ts'

const groupMessagesByTopic = (
    messages: Message[]
): Record<TopicName, Message[]> => {
    const entries = Object.values(Topics).map((topic) => [
        topic,
        messages.filter((message) => topic === message.topic_name),
    ])

    return Object.fromEntries(entries)
}

export const getMessagesByTopic = async (
    params: string
): Promise<ApiResponse<Record<TopicName, Message[]>>> => {
    const searchParams = new URLSearchParams(params)

    if (searchParams.get('fom') === 'now') {
        searchParams.set('fom', new Date().toISOString())
    }

    if (searchParams.get('tom') === 'now') {
        searchParams.set('tom', new Date().toISOString())
    }

    const messages = await fetchMessages(searchParams)

    if (messages.error) {
        return messages
    }

    return { data: groupMessagesByTopic(messages.data), error: null }
}
