'use server'

import { TestData } from '@/fakes/testData.ts'

export const getMessagesByTopic = async (params: SearchParams) => {
    const fom = params.fom ? new Date(params.fom) : null
    const tom = params.tom ? new Date(params.tom) : null
    const topics = params.topics?.split(',')

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
