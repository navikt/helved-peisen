import { test } from '@playwright/test'
import { subDays } from 'date-fns/subDays'
import { waitForSearchParams } from '@/tests/dateRangeSelect.helpers.ts'

test('oppdaterer search params med fom -> tom = now -> now', async ({
    page,
}) => {
    await page.goto(
        `http://localhost:3000/kafka?fom=${new Date().toISOString()}&tom=${new Date().toISOString()}`
    )
    await page.getByTestId('date-range-fom').click()
    await page.getByRole('tab', { name: 'Nå' }).click()
    await page.getByRole('button', { name: 'Sett tiden til "Nå"' }).click()
    await page.getByTestId('date-range-tom').click()
    await page.getByRole('tab', { name: 'Nå' }).click()
    await page.getByRole('button', { name: 'Sett tiden til "Nå"' }).click()

    await waitForSearchParams(page, {
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
    await page.getByTestId('date-range-fom').click()
    await page.getByLabel('', { exact: true }).first().click()
    await page.getByLabel('', { exact: true }).first().fill('02')
    await page
        .getByRole('tabpanel', { name: 'Relativ' })
        .getByRole('combobox')
        .selectOption('hours')
    await page.getByRole('button', { name: 'Oppdater' }).click()
    await page.getByTestId('date-range-tom').click()
    await page.getByRole('tab', { name: 'Nå' }).click()
    await page.getByRole('button', { name: 'Sett tiden til "Nå"' }).click()

    await waitForSearchParams(page, {
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
    const tom = subDays(new Date(), 20).toISOString()
    await page.goto(
        `http://localhost:3000/kafka?fom=${new Date().toISOString()}&tom=${tom}`
    )
    await page.getByTestId('date-range-fom').click()
    await page.getByRole('tab', { name: 'Absolutt' }).click()
    await page.getByRole('textbox', { name: 'Valgt tidspunkt Valgt' }).click()
    await page
        .getByRole('textbox', { name: 'Valgt tidspunkt Valgt' })
        .fill('1.1.2020, 12:04:57')
    await page.getByRole('button', { name: 'Oppdater' }).click()
    await page.getByTestId('date-range-tom').click()
    await page.getByLabel('', { exact: true }).first().click()
    await page.getByLabel('', { exact: true }).first().fill('04')
    await page
        .getByRole('tabpanel', { name: 'Relativ' })
        .getByRole('combobox')
        .selectOption('hours')
    await page.getByRole('button', { name: 'Oppdater' }).click()

    await waitForSearchParams(page, {
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
