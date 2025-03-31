'use server'

import { TestData } from '@/fakes/testData.ts'

const cache: Record<string, ReturnType<typeof TestData.messagesByTopic>> = {}

const getKey = (fom?: Date, tom?: Date) => {
    return `${fom?.toISOString()}${tom?.toISOString()}`
}

const getCachedMessages = (fom?: Date, tom?: Date) => {
    if (process.env.NODE_ENV === 'production') {
        return
    }
    const key = getKey(fom, tom)
    return cache[key]
}

const saveMessages = (
    messages: ReturnType<typeof TestData.messagesByTopic>,
    fom?: Date,
    tom?: Date
) => {
    const key = getKey(fom, tom)
    cache[key] = messages
}

export const getMessagesByTopic = async (
    fom?: Date,
    tom?: Date,
    topics?: string[]
) => {
    const cached = getCachedMessages(fom, tom)
    if (cached) {
        return cached
    }

    const filteredByDates =
        fom && tom
            ? TestData.messagesByTopic({ fom, tom })
            : TestData.messagesByTopic()

    const filteredByTopics = topics
        ? Object.entries(filteredByDates).filter(([topic, _]) =>
              topics.includes(topic)
          )
        : Object.entries(filteredByDates)

    const messages = Object.fromEntries(filteredByTopics)
    saveMessages(messages, fom, tom)
    return messages
}
