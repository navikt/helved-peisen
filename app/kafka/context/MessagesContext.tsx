'use client'

import { createContext, type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'

import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { type ApiResponse, isFailureResponse, PaginatedResponse } from '@/lib/api/types.ts'
import type { Message, TopicName } from '@/app/kafka/types.ts'
import { useFiltere } from '../Filtere'

type MessagesContextValue = {
    loading: boolean
    messages: ApiResponse<PaginatedResponse<Message>> | null
    fetchAdditionalMessages: () => void
}

export const MessagesContext = createContext<MessagesContextValue>({
    loading: false,
    messages: null,
    fetchAdditionalMessages: () => null,
})

export const MessagesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [messages, setMessages] = useState<ApiResponse<PaginatedResponse<Message>> | null>(null)
    const [loading, setLoading] = useState(true)
    const filtere = useFiltere()

    const lastTimestamp = useMemo(() => {
        if (!messages?.data) return null
        return messages.data.items.reduce(
            (latest, current) => (latest < current.system_time_ms ? current.system_time_ms : latest),
            Number.MIN_SAFE_INTEGER
        )
    }, [messages])

    const fetchMessages = useCallback(() => {
        setLoading(true)
        getMessagesByTopic(filtere).then((res) => {
            setMessages(res)
            setLoading(false)
        })
    }, [filtere])

    const fetchAdditionalMessages = useCallback(async () => {
        if (!lastTimestamp) return

        setLoading(true)

        const response = await getMessagesByTopic({
            ...filtere,
            fom: new Date(lastTimestamp).toISOString(),
            tom: 'now',
        })

        if (isFailureResponse(response)) {
            setMessages(response)
        } else {
            setMessages((prev) => {
                if (!prev || isFailureResponse(prev)) return response
                return {
                    ...prev,
                    data: {
                        items: response.data.items,
                        total: response.data.total,
                    },
                }
            })
        }

        setLoading(false)
    }, [filtere, lastTimestamp])

    useEffect(
        function updateMessages() {
            if (filtere.fom && filtere.tom) {
                fetchMessages()
            }
        },
        [filtere]
    )

    return (
        <MessagesContext.Provider value={{ loading, messages, fetchAdditionalMessages }}>
            {children}
        </MessagesContext.Provider>
    )
}
