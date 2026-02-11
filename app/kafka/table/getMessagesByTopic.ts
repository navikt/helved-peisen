import { Message, TopicName, Topics } from '@/app/kafka/types.ts'
import { fetchMessages } from '@/lib/io.ts'
import { ApiResponse, PaginatedResponse } from '@/lib/api/types.ts'
import type { FiltereValue } from '../Filtere'

const groupMessagesByTopic = (messages: Message[]): Record<TopicName, Message[]> => {
    const entries = Object.values(Topics).map((topic) => [
        topic,
        messages.filter((message) => topic === message.topic_name),
    ])

    return Object.fromEntries(entries)
}

function sanitizeFilters(obj: Record<string, string | number | boolean | null>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, value]) => !!value)
            .map(([key, value]) => [key, value!!.toString()])
    ) as Record<string, string>
}

export const getMessagesByTopic = async (filtere: FiltereValue): Promise<ApiResponse<PaginatedResponse<Message>>> => {
    const searchParams = new URLSearchParams(sanitizeFilters({ ...filtere, setFiltere: null }))

    if (searchParams.get('fom') === 'now') {
        searchParams.set('fom', new Date().toISOString())
    }

    if (searchParams.get('tom') === 'now') {
        searchParams.set('tom', new Date().toISOString())
    }

    try {
        const page = await fetchMessages(searchParams)
        return {
            data: page,
            error: null,
        }
    } catch (e: unknown) {
        if (e instanceof Error) {
            return { data: null, error: e.message }
        }

        return { data: null, error: `Klarte ikke hente meldinger: ${e}` }
    }
}
