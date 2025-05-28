import { describe, expect, test } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMessageMap } from '@/app/kafka/chart/useMessageMap.ts'
import { ReadonlyURLSearchParams } from 'next/navigation'
import { TestData } from '@/fakes/testData.ts'
import { addDays } from 'date-fns'

describe('useMessageMap', () => {
    test('genererer et map med datonøkler og meldinger som faller innenfor disse, dagsinkrementer', () => {
        const fom = new Date(2020, 0, 1).toISOString()
        const tom = new Date(2020, 0, 31).toISOString()
        const searchParams = new URLSearchParams(
            `fom=${fom}&tom=${tom}`
        ) as ReadonlyURLSearchParams
        const messages = [
            TestData.message({ timestamp_ms: new Date(2020, 0, 2).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 0, 2).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 0, 3).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 0, 3).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 0, 3).getTime() }),
        ]

        const { result } = renderHook(() =>
            useMessageMap(searchParams, messages)
        )

        const [map, increment] = result.current!!

        expect(Object.keys(map)).toHaveLength(31)
        expect(map[fom]).toHaveLength(0)
        expect(map[new Date(2020, 0, 2).toISOString()]).toHaveLength(2)
        expect(map[new Date(2020, 0, 3).toISOString()]).toHaveLength(3)
        expect(Object.values(map).flat()).toHaveLength(5)
        expect(increment).toEqual("days")
    })
    test('beholder tidspunkt for fom og har samme tidspunkt for dagsinkrementene', () => {
        const fom = new Date(2020, 0, 1, 10, 21, 15).toISOString()
        const tom = new Date(2020, 0, 31).toISOString()
        const searchParams = new URLSearchParams(
            `fom=${fom}&tom=${tom}`
        ) as ReadonlyURLSearchParams
        const messages = [
            TestData.message({ timestamp_ms: new Date(2020, 0, 1).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 0, 2).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 0, 3).getTime() }),
            TestData.message({ timestamp_ms: new Date(2020, 1, 1).getTime() }),
        ]

        const { result } = renderHook(() =>
            useMessageMap(searchParams, messages)
        )

        const [map, increment] = result.current!!

        expect(Object.keys(map)).toHaveLength(30)
        expect(map[fom]).toHaveLength(1)
        expect(map[addDays(fom, 1).toISOString()]).toHaveLength(1)
        expect(map[addDays(fom, 2).toISOString()]).toHaveLength(0)
        expect(Object.values(map).flat()).toHaveLength(2)
        expect(increment).toEqual("days")
    })
})
