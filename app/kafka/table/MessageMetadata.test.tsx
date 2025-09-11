import { TestData } from '@/fakes/testData'
import { render, screen } from '@testing-library/react'
import { describe, test } from 'vitest'
import { MessageMetadata } from './MessageMetadata'
import { expect } from 'vitest'

describe('MessageMetadata', () => {
    test('rendrer metadata for helved.avstemming.v1', () => {
        const message = TestData.message({
            topic_name: 'helved.avstemming.v1',
            value: TestData.avstemming('TILTPENG'),
        })
        render(<MessageMetadata message={message} />)

        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('TILTPENG')).toBeVisible()
    })

    test('rendrer metadata for helved.oppdrag.v1 uten kvittering', () => {
        const message = TestData.message({
            topic_name: 'helved.oppdrag.v1',
            value: TestData.oppdrag(),
        })
        render(<MessageMetadata message={message} />)

        // Viser kvittering
        expect(screen.queryByText('Mmel')).toBeNull()

        // Viser oppdragsdata
        expect(screen.getByText('Sak-ID')).toBeVisible()
        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('Endringskode')).toBeVisible()
    })

    test('rendrer metadata for helved.oppdrag.v1 med kvittering', () => {
        const message = TestData.message({
            topic_name: 'helved.oppdrag.v1',
            value: TestData.oppdrag(true),
        })
        render(<MessageMetadata message={message} />)

        // Viser kvittering
        expect(screen.getByText('Mmel')).toBeVisible()

        // Viser oppdragsdata
        expect(screen.getByText('Sak-ID')).toBeVisible()
        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('Endringskode')).toBeVisible()
    })
})
