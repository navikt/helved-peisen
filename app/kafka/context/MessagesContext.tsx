'use client'

import { createContext, type PropsWithChildren, useCallback, useEffect, useState } from 'react'

import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { type ApiResponse, PaginatedResponse } from '@/lib/api/types.ts'
import type { Message } from '@/app/kafka/types.ts'
import { useFiltere } from '../Filtere'

type MessagesContextValue = {
    loading: boolean
    messages: ApiResponse<PaginatedResponse<Message>> | null
    fetchMessages: () => void
}

export const MessagesContext = createContext<MessagesContextValue>({
    loading: false,
    messages: null,
    fetchMessages: () => null,
})

export const MessagesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [messages, setMessages] = useState<ApiResponse<PaginatedResponse<Message>> | null>(null)
    const [loading, setLoading] = useState(true)
    const filtere = useFiltere()

    const fetchMessages = useCallback(() => {
        setLoading(true)
        getMessagesByTopic(filtere).then((res) => {
            setMessages(res)
            setLoading(false)
        })
    }, [filtere])

    useEffect(
        function updateMessages() {
            if (filtere.fom && filtere.tom) {
                fetchMessages()
            }
        },
        [filtere]
    )

    return <MessagesContext.Provider value={{ loading, messages, fetchMessages }}>{children}</MessagesContext.Provider>
}
