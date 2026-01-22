import { Message, TopicName, Topics } from '@/app/kafka/types.ts'
import { fetchMessages } from '@/lib/io.ts'
import { ApiResponse } from '@/lib/api/types.ts'

const groupMessagesByTopic = (messages: Message[]): Record<TopicName, Message[]> => {
    const entries = Object.values(Topics).map((topic) => [
        topic,
        messages.filter((message) => topic === message.topic_name),
    ])

    return Object.fromEntries(entries)
}

export const getMessagesByTopic = async (params: string): Promise<ApiResponse<Record<TopicName, Message[]>>> => {
    const searchParams = new URLSearchParams(params)

    if (searchParams.get('fom') === 'now') {
        searchParams.set('fom', new Date().toISOString())
    }

    if (searchParams.get('tom') === 'now') {
        searchParams.set('tom', new Date().toISOString())
    }

    try {
        const messages = await fetchMessages(searchParams)
        return {
            data: groupMessagesByTopic(messages),
            error: null,
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            return { data: null, error: e.message }
        }

        return { data: null, error: `Klarte ikke hente meldinger: ${e}` }
    }
}
