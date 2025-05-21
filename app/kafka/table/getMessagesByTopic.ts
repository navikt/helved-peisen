'use server'

import { Message, TopicName, Topics } from '@/app/kafka/types.ts'
import { fetchMessages } from '@/lib/api/kafka.ts'
import { parseSearchParamDate } from '@/lib/date.ts'

export const getMessagesByTopic = async (
    params: string
): Promise<ApiResponse<Record<TopicName, Message[]>>> => {
    const searchParams = new URLSearchParams(params)

    const fom = parseSearchParamDate(searchParams, 'fom')
    if (fom) {
        searchParams.set('fom', fom)
    }

    const tom = parseSearchParamDate(searchParams, 'tom')
    if (tom) {
        searchParams.set('tom', tom)
    }

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
