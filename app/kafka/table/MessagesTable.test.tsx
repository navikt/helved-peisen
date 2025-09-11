import { render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { MessagesTable } from './MessagesTable'
import type { Message } from '@/app/kafka/types.ts'
import { TestData } from '@/fakes/testData'
import { userEvent } from '@testing-library/user-event'

describe('MessagesTable', () => {
    test('sorterer på timestamp', async () => {
        const user = userEvent.setup()

        const messages: Record<string, Message[]> = {
            'helved.oppdrag.v1': [
                TestData.message({ timestamp_ms: 123, key: '123' }),
                TestData.message({ timestamp_ms: 369, key: '369' }),
                TestData.message({ timestamp_ms: 246, key: '246' }),
            ],
        }
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

    test('filtrerer vekk alle utenom de siste meldingene på samme nøkkel og topic', async () => {
        const user = userEvent.setup()

        const messages: Record<string, Message[]> = {
            'helved.oppdrag.v1': [
                TestData.message({ timestamp_ms: 0, key: 'a' }),
                TestData.message({ timestamp_ms: 1, key: 'a' }),
                TestData.message({ timestamp_ms: 0, key: 'b' }),
            ],
            'helved.kvittering.v1': [
                TestData.message({ topic_name: 'helved.kvittering.v1', timestamp_ms: 2, key: 'a' }),
                TestData.message({ topic_name: 'helved.kvittering.v1', timestamp_ms: 0, key: 'b' }),
                TestData.message({ topic_name: 'helved.kvittering.v1', timestamp_ms: 1, key: 'b' }),
            ],
        }
        render(<MessagesTable messages={messages} />)
        expect(screen.getAllByRole('row')).toHaveLength(7)

        await user.click(screen.getByText('Filter'))
        await user.click(screen.getByText('Vis siste'))
        expect(screen.getAllByRole('row')).toHaveLength(5)
    })
})
