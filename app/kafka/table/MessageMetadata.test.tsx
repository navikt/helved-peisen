import { render, screen } from '@testing-library/react'
import { describe, test } from 'vitest'
import { MessageMetadata } from './MessageMetadata'
import { expect } from 'vitest'
import { type Message } from '@/app/kafka/types.ts'

import messages from '@/fakes/data/messages.json' with { type: 'json' }

describe('MessageMetadata', () => {
    test('rendrer metadata for helved.avstemming.v1', () => {
        const message = messages.find((it) => it.topic_name === 'helved.avstemming.v1') as Message
        render(<MessageMetadata message={message} />)

        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('TILLST')).toBeVisible()
    })

    test('rendrer metadata for helved.oppdrag.v1 uten kvittering', () => {
        const message = messages.find(
            (it) => it.topic_name === 'helved.oppdrag.v1' && !it.value.includes('mmel')
        ) as Message
        render(<MessageMetadata message={message} />)

        // Viser kvittering
        expect(screen.queryByText('Mmel')).toBeNull()

        // Viser oppdragsdata
        expect(screen.getByText('Sak-ID')).toBeVisible()
        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('Endringskode')).toBeVisible()
    })

    test('rendrer metadata for helved.oppdrag.v1 med kvittering', () => {
        const message = messages.find(
            (it) => it.topic_name === 'helved.oppdrag.v1' && it.value.includes('mmel')
        ) as Message
        render(<MessageMetadata message={message} />)

        // Viser kvittering
        expect(screen.getByText('Mmel')).toBeVisible()

        // Viser oppdragsdata
        expect(screen.getByText('Sak-ID')).toBeVisible()
        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('Endringskode')).toBeVisible()
    })

    test('rendrer metadata for helved.utbetalinger.v1', () => {
        const message = messages.find((it) => it.topic_name === 'helved.utbetalinger.v1') as Message
        render(<MessageMetadata message={message} />)

        expect(screen.getByText('Fagsystem')).toBeVisible()
        expect(screen.getByText('Action')).toBeVisible()
        expect(screen.getByText('Første utbetaling på sak')).toBeVisible()
        expect(screen.getByText('Sak-ID')).toBeVisible()
        expect(screen.getByText('Behandling-ID')).toBeVisible()
        expect(screen.getByText('Stønad')).toBeVisible()
    })

    test('rendrer metadata for helved.status.v1', () => {
        const message = messages.find((it) => it.topic_name === 'helved.status.v1') as Message
        render(<MessageMetadata message={message} />)

        expect(screen.getByText('Status')).toBeVisible()
        expect(screen.getByText('Ytelse')).toBeVisible()
    })
})
