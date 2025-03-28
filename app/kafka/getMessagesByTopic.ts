'use server'

import { TestData } from '@/fakes/testData.ts'

export const getMessagesByTopic = async () => {
    return TestData.messagesByTopic()
}
