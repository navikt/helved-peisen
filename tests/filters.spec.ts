import { test } from '@playwright/test'
import {
    deselectStatus,
    expectStatuses,
    expectType,
    selectStatus,
    selectType,
    waitForTasksToLoad,
} from '@/tests/filters.helpers.ts'

test('oppdaterer search params med valgt status', async ({ page }) => {
    await page.goto('/scheduler')
    await waitForTasksToLoad(page)

    await selectStatus('COMPLETE', page)
    expectStatuses(['COMPLETE'], page)

    await selectStatus('FAIL', page)
    expectStatuses(['COMPLETE', 'FAIL'], page)

    await deselectStatus('COMPLETE', page)

    expectStatuses(['FAIL'], page)
})

test('oppdaterer search params med valgt type', async ({ page }) => {
    await page.goto('/scheduler')
    await waitForTasksToLoad(page)

    await selectType('Iverksetting', page)

    await page.waitForURL('http://localhost:3000/scheduler?kind=Iverksetting')
    await waitForTasksToLoad(page)

    expectType('Iverksetting', page)
})
