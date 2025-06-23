import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { JsonView } from './JsonView'

describe('JsonView', () => {
    test('rendrer json-objekter', () => {
        const json = {
            a: 'a',
            b: 'b',
            c: 123,
            d: [1, 2, '3'],
            e: null,
            f: {
                a: 1,
                b: 2,
            },
        }

        render(<JsonView json={json} />)

        expect(screen.getAllByText('"a"')).toHaveLength(3)
        expect(screen.getAllByText('"b"')).toHaveLength(3)
        expect(screen.getAllByText('"c"')).toHaveLength(1)
        expect(screen.getAllByText('"d"')).toHaveLength(1)
        expect(screen.getAllByText('"e"')).toHaveLength(1)
        expect(screen.getAllByText('"f"')).toHaveLength(1)
        expect(screen.getAllByText('[', { exact: false })).toHaveLength(1)
        expect(screen.getAllByText(']', { exact: false })).toHaveLength(1)
        expect(screen.getAllByText('123')).toHaveLength(1)
    })

    test('rendrer json-strenger', () => {
        const json = '{"a":"b"}'

        render(<JsonView json={json} />)

        expect(screen.getByText(`"${json}"`)).toBeVisible()
    })
})
