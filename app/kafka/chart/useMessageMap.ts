import { useMemo } from 'react'
import {
    add,
    differenceInMinutes,
    isAfter,
    isBefore,
    isEqual,
    startOfDay,
    startOfHour,
    startOfMinute,
} from 'date-fns'
import { SearchParams } from 'next/dist/server/request/search-params'

import type { Message } from '@/app/kafka/types'

const getStartDate = (searchParams: SearchParams) => {
    const start = searchParams['fom']
    return typeof start === 'string' ? new Date(start) : null
}

const getEndDate = (searchParams: SearchParams) => {
    const end = searchParams['tom']
    return typeof end === 'string' ? new Date(end) : null
}

type Increment = 'days' | 'hours' | 'minutes'

const getIncrement = (start: Date, end: Date): Increment => {
    const diff = differenceInMinutes(end, start)
    if (diff < 600) {
        return 'minutes'
    } else if (diff < 6000) {
        return 'hours'
    } else {
        return 'days'
    }
}

const getMessageMap = (
    start: Date,
    end: Date,
    increment: Increment
): Record<string, Message[]> => {
    const map: Record<string, Message[]> = {}

    let currentTime = truncateDateToIncrement(start, increment)
    while (currentTime.getTime() <= end.getTime()) {
        map[currentTime.toISOString()] = []
        currentTime = add(currentTime, { [increment]: 1 })
    }

    return map
}

const truncateDateToIncrement = (date: Date, increment: Increment) => {
    switch (increment) {
        case 'days': {
            return startOfDay(date)
        }
        case 'hours': {
            return startOfHour(date)
        }
        case 'minutes': {
            return startOfMinute(date)
        }
    }
}

export const useMessageMap = (
    searchParams: SearchParams,
    messages: Message[]
) => {
    // Oppretter et map hvor nøkkel er tidspunktet for meldingene og verdien er meldingene som havner innenfor
    // tidsspennet hvor fom er tidspunkt og tom er tidspunkt + inkrement (dag, time, minutt)
    return useMemo(() => {
        const start = getStartDate(searchParams)
        const end = getEndDate(searchParams)

        if (!start || !end) {
            return null
        }

        const increment = getIncrement(start, end)
        const messageMap = getMessageMap(start, end, increment)
        const filteredMessages = messages.filter(
            ({ timestamp }) =>
                isEqual(timestamp, end) ||
                isEqual(timestamp, start) ||
                (isBefore(timestamp, end) && isAfter(timestamp, start))
        )

        for (const message of filteredMessages) {
            const key = truncateDateToIncrement(
                new Date(message.timestamp),
                increment
            ).toISOString()

            messageMap[key].push(message)
        }
        return messageMap
    }, [searchParams, messages])
}
