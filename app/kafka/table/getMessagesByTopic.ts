'use server'

import { TestData } from '@/fakes/testData.ts'

export const getMessagesByTopic = async (params: SearchParams) => {
    const fom = params.fom ? new Date(params.fom) : null
    const tom = params.tom ? new Date(params.tom) : null
    return fom && tom
        ? TestData.messagesByTopic({ fom, tom })
        : TestData.messagesByTopic()
}
