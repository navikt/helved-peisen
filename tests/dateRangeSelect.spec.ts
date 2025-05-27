import { test } from '@playwright/test'
import {
    expectDate,
    setAbsoluteDate,
    setNowDate,
    setRelativeDate,
    waitForSearchParam,
} from '@/tests/dateRangeSelect.helpers.ts'

test('oppdaterer search params med fom -> tom = now -> now', async ({
    page,
}) => {
    await page.goto(`http://localhost:3000/kafka`)

    await waitForSearchParam(page, 'fom', (val) => val !== null)
    await waitForSearchParam(page, 'tom', (val) => val !== null)

    await setNowDate(page, 'date-range-fom')
    await expectDate(page, 'fom', { now: true })

    await setNowDate(page, 'date-range-tom')
    await expectDate(page, 'tom', { now: true })
})

test('oppdaterer search params med fom -> tom = 2 timer siden -> now', async ({
    page,
}) => {
    await page.goto(`http://localhost:3000/kafka`)

    await setRelativeDate(page, 'date-range-fom', 'hours', 2)
    await expectDate(page, 'fom', {
        relative: { expectedHoursAgo: 2, toleranceHours: 0 },
    })

    await setNowDate(page, 'date-range-tom')
    await expectDate(page, 'tom', { now: true })
})

test('oppdaterer search params med fom -> tom = 2020-01-01 -> 4 timer siden', async ({
    page,
}) => {
    await page.goto(`http://localhost:3000/kafka`)

    await setAbsoluteDate(page, 'date-range-fom', new Date(2020, 0, 1))
    await expectDate(page, 'fom', {
        absolute: { year: 2020, month: 0, date: 1 },
    })

    await setRelativeDate(page, 'date-range-tom', 'hours', 4)
    await expectDate(page, 'tom', {
        relative: { expectedHoursAgo: 4, toleranceHours: 0 },
    })
})
