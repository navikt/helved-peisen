import type { Page } from '@playwright/test'

type AbsoluteCheck = {
    year: number
    month: number
    date: number
}

type RelativeCheck = {
    expectedHoursAgo: number
    toleranceHours?: number
}

// Waits for given predicate to return true.
// Predicate tests the value of search param with given key.
export async function waitForSearchParam(
    page: Page,
    key: string,
    predicate: (value: string) => boolean
) {
    await page.waitForFunction(
        ({ key, predicate }) => {
            const pred = eval('(' + predicate + ')')
            const params = new URL(window.location.href).searchParams
            return pred(params.get(key))
        },
        { key, predicate: predicate.toString() }
    )
}

function checkRelative(relative: RelativeCheck, value: string): boolean {
    const date = new Date(value)
    const now = new Date()
    const diffHrs = Math.round(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )
    const rtf = new Intl.RelativeTimeFormat('nb-NO', {
        numeric: 'auto',
    })
    const formatted = rtf.format(-diffHrs, 'hour')
    const diff = Math.abs(diffHrs - relative.expectedHoursAgo)

    if (diff > (relative.toleranceHours || 0)) {
        return false
    }

    return formatted.includes('for')
}

// Checks that the url has search param with a date value matching the given
// absolute or relative time predicates or the value "now"
export async function expectDate(
    page: Page,
    key: string,
    options: {
        absolute?: AbsoluteCheck
        relative?: RelativeCheck
        now?: boolean
    }
) {
    await page.waitForFunction(
        ({ key, options, checkRelativeSerialized }) => {
            const params = new URL(window.location.href).searchParams
            const date = params.get(key)

            if (!date) {
                return false
            }

            if (options.now) {
                return date === 'now'
            }

            if (options.relative) {
                const checkRelative = eval('(' + checkRelativeSerialized + ')')
                return checkRelative(options.relative, date)
            }

            if (options.absolute) {
                const dateObject = new Date(date)
                return (
                    dateObject.getFullYear() === options.absolute.year &&
                    dateObject.getMonth() === options.absolute.month &&
                    dateObject.getDate() === options.absolute.date
                )
            }

            return false
        },
        { key, options, checkRelativeSerialized: checkRelative.toString() }
    )
}

export async function setAbsoluteDate(page: Page, testId: string, date: Date) {
    await page.getByTestId(testId).click()
    await page.getByRole('tab', { name: 'Absolutt' }).click()
    await page.getByRole('textbox', { name: 'Valgt tidspunkt Valgt' }).click()
    await page
        .getByRole('textbox', { name: 'Valgt tidspunkt Valgt' })
        .fill(date.toLocaleString('nb-NO'))
    await page.getByRole('button', { name: 'Oppdater' }).click()
}

export async function setRelativeDate(
    page: Page,
    testId: string,
    unit: 'seconds' | 'minutes' | 'hours' | 'weeks' | 'months' | 'years',
    duration: number
) {
    await page.getByTestId(testId).click()
    await page.getByLabel('', { exact: true }).first().click()
    await page.getByLabel('', { exact: true }).first().fill(`${duration}`)
    await page
        .getByRole('tabpanel', { name: 'Relativ' })
        .getByRole('combobox')
        .selectOption(unit)
    await page.getByRole('button', { name: 'Oppdater' }).click()
}

export async function setNowDate(page: Page, testId: string) {
    await page.getByTestId(testId).click()
    await page.getByRole('tab', { name: 'Nå' }).click()
    await page.getByRole('button', { name: 'Sett tiden til "Nå"' }).click()
}
