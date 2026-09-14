// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { parsedXML, xmlToJson } from './xml'

vi.mock('@navikt/next-logger', () => ({
    logger: { warn: vi.fn(), error: vi.fn() },
}))

describe('XML parsing', () => {
    it('parses the action type used for Kafka message badges', () => {
        const doc = parsedXML('<avstemming><aksjon><aksjonType>DATA</aksjonType></aksjon></avstemming>')
        expect(doc.getElementsByTagName('aksjonType')[0].textContent).toBe('DATA')
    })

    it('preserves attributes and repeated elements in the JSON view', () => {
        expect(xmlToJson('<root id="1"><item>A</item><item>B</item></root>')).toEqual({
            '@attributes': { id: '1' },
            item: ['A', 'B'],
        })
    })

    it('rejects malformed XML', () => {
        expect(() => parsedXML('<root><item></root>')).toThrow()
    })
})
