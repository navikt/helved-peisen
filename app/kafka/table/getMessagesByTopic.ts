'use server'

import { TestData } from '@/fakes/testData.ts'

export const getMessagesByTopic = async (
    fom?: Date,
    tom?: Date,
    topics?: string[]
) => {
    const filteredByDates =
        fom && tom
            ? TestData.messagesByTopic({ fom, tom })
            : TestData.messagesByTopic()

    const filteredByTopics = topics
        ? Object.entries(filteredByDates).filter(([topic, _]) =>
              topics.includes(topic)
          )
        : Object.entries(filteredByDates)

    return Object.fromEntries(filteredByTopics)
}
