'use client'

import { createContext, type PropsWithChildren, useCallback, useEffect, useState } from 'react'

import { getMessages } from '@/app/kafka/table/getMessages'
import { type ApiResponse, PaginatedResponse } from '@/lib/api/types.ts'
import type { Message } from '@/app/kafka/types.ts'
import { useFiltere } from '../Filtere'

function sanitizeFilters(obj: Record<string, string | number | boolean | null>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, value]) => !!value)
            .map(([key, value]) => [key, value!!.toString()])
            .map(([key, value]) => [key, value === 'now' ? new Date().toISOString() : value])
    ) as Record<string, string>
}

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
        getMessages(sanitizeFilters({ ...filtere, setFiltere: null })).then((res) => {
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
