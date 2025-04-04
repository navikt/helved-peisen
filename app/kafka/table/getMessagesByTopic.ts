'use server'

import { TestData } from '@/fakes/testData.ts'
import { Message, TopicName } from '@/app/kafka/types.ts'
import { fetchMessages } from '@/lib/api/kafka.ts'
import { ReadonlyURLSearchParams } from 'next/navigation'

const Topics = {
    oppdrag: 'helved.oppdrag.v1',
    kvittering: 'helved.kvittering.v1',
    simulering: 'helved.simuleringer.v1',
    utbetalinger: 'helved.utbetalinger.v1',
    saker: 'helved.saker.v1',
    aap: 'helved.utbetalinger-aap.v1',
} as const

const cache: Record<string, Record<TopicName, Message[]>> = {}

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

const getMessages = async (
    searchParams: ReadonlyURLSearchParams
): Promise<ApiResponse<Record<TopicName, Message[]>>> => {
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

const getTestMessages = async (searchParams: ReadonlyURLSearchParams) => {
    const fom = searchParams.get('fom')
    const tom = searchParams.get('tom')
    const topics =
        (searchParams.get('topics')?.split(',') as Array<TopicName>) ??
        undefined

    const fomDate = fom ? new Date(fom) : undefined
    const tomDate = tom ? new Date(tom) : undefined

    const cached = getCachedMessages(fomDate, tomDate)
    if (cached) {
        return { data: cached, error: null }
    }

    const messages =
        fomDate && tomDate
            ? TestData.messages(topics, { fom: fomDate, tom: tomDate })
            : TestData.messages(topics)

    const entries = Object.values(Topics).map((topic) => [
        topic,
        messages.filter((message) => topic === message.topic_name),
    ])

    const messageMap = Object.fromEntries(entries)
    saveMessages(messageMap, fomDate, tomDate)

    return { data: messageMap, error: null }
}

const saveMessages = (
    messages: Record<TopicName, Message[]>,
    fom?: Date,
    tom?: Date
) => {
    const key = getKey(fom, tom)
    cache[key] = messages
}

export const getMessagesByTopic = async (
    searchParams: string
): Promise<ApiResponse<Record<TopicName, Message[]>>> => {
    const params = new ReadonlyURLSearchParams(searchParams)

    if (process.env.NODE_ENV === 'production') {
        return getMessages(params)
    } else {
        return getTestMessages(params)
    }
}
