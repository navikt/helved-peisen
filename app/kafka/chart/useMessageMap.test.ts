import { describe, expect, test } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMessageMap } from '@/app/kafka/chart/useMessageMap.ts'
import { addDays } from 'date-fns'
import { type ReadonlyURLSearchParams } from 'next/navigation'
import { type Message } from '@/app/kafka/types.ts'

import messages from '@/fakes/data/messages.json' with { type: 'json' }

describe('useMessageMap', () => {
    test('genererer et map med datonøkler og meldinger som faller innenfor disse, dagsinkrementer', () => {
        const fom = new Date(2025, 9, 1).toISOString()
        const tom = new Date(2025, 9, 31).toISOString()
        const searchParams = new URLSearchParams(`fom=${fom}&tom=${tom}`) as ReadonlyURLSearchParams
        const { result } = renderHook(() => useMessageMap(searchParams, messages as Message[]))
        const [map, increment] = result.current!!

        expect(Object.keys(map)).toHaveLength(31)
        expect(map[fom]).toHaveLength(198)
        expect(map[addDays(fom, 1).toISOString()]).toHaveLength(33)
        expect(map[addDays(fom, 2).toISOString()]).toHaveLength(0)
        expect(Object.values(map).flat()).toHaveLength(231)
        expect(increment).toEqual('days')
    })

    test('beholder tidspunkt for fom og har samme tidspunkt for dagsinkrementene', () => {
        const fom = new Date(2025, 9, 1, 10, 21, 15).toISOString()
        const tom = new Date(2025, 9, 31).toISOString()
        const searchParams = new URLSearchParams(`fom=${fom}&tom=${tom}`) as ReadonlyURLSearchParams
        const { result } = renderHook(() => useMessageMap(searchParams, messages as Message[]))
        const [map, increment] = result.current!!

        expect(Object.keys(map)).toHaveLength(30)
        expect(map[fom]).toHaveLength(230)
        expect(map[addDays(fom, 1).toISOString()]).toHaveLength(0)
        expect(Object.values(map).flat()).toHaveLength(230)
        expect(increment).toEqual('days')
    })
})
