import { render, screen, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { MessagesTable } from './MessagesTable'
import type { Message } from '@/app/kafka/types.ts'
import { TestData } from '@/fakes/testData'
import { userEvent } from '@testing-library/user-event'

describe('MessagesTable', () => {
    // TODO: Finne en annen måte å teste denne på. Playwright?
    test.skip('sorterer på timestamp', async () => {
        const user = userEvent.setup()

        const messages = [
            TestData.message({ timestamp_ms: 123, key: '123' }),
            TestData.message({ timestamp_ms: 369, key: '369' }),
            TestData.message({ timestamp_ms: 246, key: '246' }),
        ]
        render(<MessagesTable messages={messages} />)

        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(4)

        // Expect descending sort order
        expect(within(rows[0]).getByText('369')).toBeVisible()
        expect(within(rows[1]).getByText('246')).toBeVisible()
        expect(within(rows[2]).getByText('123')).toBeVisible()

        await user.click(screen.getByText('Timestamp'))

        // Expect ascending sort order
        expect(within(rows[0]).getByText('123')).toBeVisible()
        expect(within(rows[1]).getByText('246')).toBeVisible()
        expect(within(rows[2]).getByText('369')).toBeVisible()

        await user.click(screen.getByText('Timestamp'))

        // Expect original sort order
        expect(within(rows[0]).getByText('123')).toBeVisible()
        expect(within(rows[1]).getByText('369')).toBeVisible()
        expect(within(rows[2]).getByText('246')).toBeVisible()
    })

    // TODO: Finne en annen måte å teste denne på. Kanskje en integrasjonstest? Playwright?
    test.skip('filtrerer vekk alle utenom de siste meldingene på samme nøkkel og topic', async () => {
        const user = userEvent.setup()

        const messages: Message[] = [
            TestData.message({ timestamp_ms: 0, key: 'a' }),
            TestData.message({ timestamp_ms: 1, key: 'a' }),
            TestData.message({ timestamp_ms: 0, key: 'b' }),
            TestData.message({ topic_name: 'helved.kvittering.v1', timestamp_ms: 2, key: 'a' }),
            TestData.message({ topic_name: 'helved.kvittering.v1', timestamp_ms: 0, key: 'b' }),
            TestData.message({ topic_name: 'helved.kvittering.v1', timestamp_ms: 1, key: 'b' }),
        ]

        render(<MessagesTable messages={messages} />)
        expect(screen.getAllByRole('row')).toHaveLength(7)

        await user.click(screen.getByText('Siste'))
        expect(screen.getAllByRole('row')).toHaveLength(5)
    })
})
