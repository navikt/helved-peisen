'use client'

import { createContext, type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { type ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'
import { useSetSearchParams } from '@/hooks/useSetSearchParams.ts'
import type { Message, TopicName } from '../types.ts'
import { ApiResponse, isFailureResponse } from '@/lib/api/types.ts'

const mergeSearchParams = (searchParams: ReadonlyURLSearchParams, overrides?: Record<string, string>) => {
    if (!overrides) return searchParams

    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(overrides)) {
        if (value === undefined) {
            params.delete(key)
        } else {
            params.set(key, value)
        }
    }

    return params
}

type MessagesContextValue = {
    loading: boolean
    messages: ApiResponse<Record<string, Message[]>> | null
    fetchAdditionalMessages: () => void
}

export const MessagesContext = createContext<MessagesContextValue>({
    loading: false,
    messages: null,
    fetchAdditionalMessages: () => null,
})

export const MessagesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const setSearchParam = useSetSearchParams()
    const [messages, setMessages] = useState<ApiResponse<Record<string, Message[]>> | null>(null)
    const [loading, setLoading] = useState(true)

    const lastTimestamp = useMemo(() => {
        if (!messages?.data) return null
        return Object.values(messages.data)
            .flat()
            .reduce(
                (latest, current) => (latest < current.system_time_ms ? current.system_time_ms : latest),
                Number.MIN_SAFE_INTEGER
            )
    }, [messages])

    const fetchMessages = useCallback(() => {
        setLoading(true)
        getMessagesByTopic(searchParams.toString()).then((res) => {
            setMessages(res)
            setLoading(false)
        })
    }, [searchParams])

    const fetchAdditionalMessages = useCallback(async () => {
        if (!lastTimestamp) return

        setLoading(true)

        const response = await getMessagesByTopic(
            mergeSearchParams(searchParams, { fom: new Date(lastTimestamp).toISOString(), tom: 'now' }).toString()
        )

        if (isFailureResponse(response)) {
            setMessages(response)
        } else {
            setMessages((prev) => {
                if (!prev || isFailureResponse(prev)) return response
                return {
                    ...prev,
                    data: Object.fromEntries(
                        Object.keys(prev.data).map((key) => {
                            const messages = prev.data[key]
                            const newMessages = response.data[key as TopicName] ?? []
                            return [key, [...messages, ...newMessages]]
                        })
                    ),
                }
            })
        }

        if (searchParams.get('tom') !== 'now') {
            setSearchParam({ tom: 'now' })
        }

        setLoading(false)
    }, [searchParams, lastTimestamp, setSearchParam])

    const fom = searchParams.get('fom')
    const tom = searchParams.get('tom')

    useEffect(() => {
        if (fom && tom) {
            fetchMessages()
        }
    }, [fom, tom, fetchMessages])

    return (
        <MessagesContext.Provider value={{ loading, messages, fetchAdditionalMessages }}>
            {children}
        </MessagesContext.Provider>
    )
}
