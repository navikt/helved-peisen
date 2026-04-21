'use client'

import { createContext, type PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { type ApiResponse, PaginatedResponse } from '@/lib/api/types'
import type { Message } from '@/app/kafka/types'
import { useFiltere } from './Filtere'

function sanitizeFilters(obj: Record<string, string | number | boolean | null>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(obj)
            .filter(([, value]) => value != null && value !== '')
            .map(([key, value]) => [key, String(value)])
            .map(([key, value]) => [key, value === 'now' ? new Date().toISOString() : value])
    ) as Record<string, string>
}

type MessagesContextValue = {
    loading: boolean
    messages: ApiResponse<PaginatedResponse<Message>> | null
    fetchMessages: (signal?: AbortSignal) => Promise<void>
}

export const MessagesContext = createContext<MessagesContextValue>({
    loading: false,
    messages: null,
    fetchMessages: async () => {},
})

export const MessagesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [messages, setMessages] = useState<ApiResponse<PaginatedResponse<Message>> | null>(null)
    const [loading, setLoading] = useState(true)
    const filtere = useFiltere()

    const fetchMessages = useCallback(
        async (signal?: AbortSignal) => {
            setLoading(true)

            const query = new URLSearchParams(sanitizeFilters({ ...filtere, setFiltere: null })).toString()

            try {
                const response = await fetch(`/api/messages?${query}`, { signal })
                const data = (await response.json()) as ApiResponse<PaginatedResponse<Message>>

                if (!signal?.aborted) {
                    setMessages(data)
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') {
                    return
                }
                throw err
            } finally {
                if (!signal?.aborted) {
                    setLoading(false)
                }
            }
        },
        [filtere]
    )

    useEffect(() => {
        if (!filtere.fom || !filtere.tom) return

        const controller = new AbortController()
        void fetchMessages(controller.signal)

        return () => {
            controller.abort()
        }
    }, [filtere.fom, filtere.tom, fetchMessages])

    return <MessagesContext.Provider value={{ loading, messages, fetchMessages }}>{children}</MessagesContext.Provider>
}
