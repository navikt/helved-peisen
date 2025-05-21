import { test } from '@playwright/test'
import {
    expectDates,
    setAbsoluteDate,
    setNowDate,
    setRelativeDate,
} from '@/tests/dateRangeSelect.helpers.ts'

test('oppdaterer search params med fom -> tom = now -> now', async ({
    page,
}) => {
    await page.goto(
        `http://localhost:3000/kafka?fom=${new Date().toISOString()}&tom=${new Date().toISOString()}`
    )
    await setNowDate(page, 'date-range-fom')
    await setNowDate(page, 'date-range-tom')

    await expectDates(page, {
        fom: { now: true },
        tom: { now: true },
    })
})

test('oppdaterer search params med fom -> tom = 2 timer siden -> now', async ({
    page,
}) => {
    await page.goto(
        `http://localhost:3000/kafka?fom=${new Date().toISOString()}&tom=${new Date().toISOString()}`
    )
    await setRelativeDate(page, 'date-range-fom', 'hours', 2)
    await setNowDate(page, 'date-range-tom')

    await expectDates(page, {
        fom: {
            relative: {
                expectedHoursAgo: 2,
                toleranceHours: 1,
            },
        },
        tom: {
            now: true,
        },
    })
})

test('oppdaterer search params med fom -> tom = 2020-01-01 -> 4 timer siden', async ({
    page,
}) => {
    await page.goto(
        `http://localhost:3000/kafka?fom=${new Date().toISOString()}&tom=${new Date().toISOString()}`
    )
    await setAbsoluteDate(page, 'date-range-fom', new Date(2020, 0, 1))
    await setRelativeDate(page, 'date-range-tom', 'hours', 4)

    await expectDates(page, {
        fom: {
            absolute: {
                year: 2020,
                month: 0,
                date: 1,
            },
        },
        tom: {
            relative: {
                expectedHoursAgo: 4,
                toleranceHours: 1,
            },
        },
    })
})
