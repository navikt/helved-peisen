import { render, screen, within } from '@testing-library/react'
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
                TestData.message({ timestamp_ms: 123 }),
                TestData.message({ timestamp_ms: 369 }),
                TestData.message({ timestamp_ms: 246 }),
            ],
        }
        render(<MessagesTable messages={messages} />)

        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(4)

        // Expect descending sort order
        expect(
            within(rows[1]).getByText('1970-01-01 - 01:00:00.369')
        ).toBeVisible()
        expect(
            within(rows[2]).getByText('1970-01-01 - 01:00:00.246')
        ).toBeVisible()
        expect(
            within(rows[3]).getByText('1970-01-01 - 01:00:00.123')
        ).toBeVisible()

        await user.click(screen.getByText('Timestamp'))

        // Expect ascending sort order
        expect(
            within(rows[1]).getByText('1970-01-01 - 01:00:00.123')
        ).toBeVisible()
        expect(
            within(rows[2]).getByText('1970-01-01 - 01:00:00.246')
        ).toBeVisible()
        expect(
            within(rows[3]).getByText('1970-01-01 - 01:00:00.369')
        ).toBeVisible()

        await user.click(screen.getByText('Timestamp'))

        // Expect original sort order
        expect(
            within(rows[1]).getByText('1970-01-01 - 01:00:00.123')
        ).toBeVisible()
        expect(
            within(rows[2]).getByText('1970-01-01 - 01:00:00.369')
        ).toBeVisible()
        expect(
            within(rows[3]).getByText('1970-01-01 - 01:00:00.246')
        ).toBeVisible()
    })
})
