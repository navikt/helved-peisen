import { createContext, useMemo } from 'react'
import { Message } from '@/app/kafka/types.ts'

type MessageContextType = {
    messagesPerKey: Record<string, number>
}

export const MessagesContext = createContext<MessageContextType>({
    messagesPerKey: {}
});

type MessagesProviderProps = {
    messages: Message[]
    children: React.ReactNode
}

export const MessagesProvider: React.FC<MessagesProviderProps> = ({ messages, children }) => {
    const messagesPerKey = useMemo(() => {
        const map: Record<string, number> = {}

        for (const message of messages) {
            if (!map[message.key]) {
                map[message.key] = 1
            } else {
                map[message.key] += 1
            }
        }

        return map
    }, [messages])
    return (
        <MessagesContext.Provider value={{ messagesPerKey }}>{children}</MessagesContext.Provider>
    )
}