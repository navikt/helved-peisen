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

export async function expectDates(
    page: Page,
    {
        fom,
        tom,
    }: {
        fom: {
            absolute?: AbsoluteCheck
            relative?: RelativeCheck
            now?: boolean
        }
        tom: {
            absolute?: AbsoluteCheck
            relative?: RelativeCheck
            now?: boolean
        }
    }
) {
    await page.waitForFunction(
        ({ fomCheck, tomCheck }) => {
            const params = new URL(window.location.href).searchParams
            const fom = params.get('fom')
            const tom = params.get('tom')

            if (!fom || !tom) {
                return false
            }

            if (fomCheck.now) {
                if (fom !== 'now') return false
            }

            if (tomCheck.now) {
                if (tom !== 'now') return false
            }

            function checkRelative(
                relative: RelativeCheck,
                value: string
            ): boolean {
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

            if (fomCheck.relative) {
                if (!checkRelative(fomCheck.relative, fom)) {
                    return false
                }
            }

            if (tomCheck.relative) {
                if (!checkRelative(tomCheck.relative, tom)) {
                    return false
                }
            }

            if (fomCheck.absolute) {
                const date = new Date(fom)
                if (
                    date.getFullYear() !== fomCheck.absolute.year ||
                    date.getMonth() !== fomCheck.absolute.month ||
                    date.getDate() !== fomCheck.absolute.date
                )
                    return false
            }

            if (tomCheck.absolute) {
                const date = new Date(tom)
                if (
                    date.getFullYear() !== tomCheck.absolute.year ||
                    date.getMonth() !== tomCheck.absolute.month ||
                    date.getDate() !== tomCheck.absolute.date
                )
                    return false
            }

            return true
        },
        { fomCheck: fom, tomCheck: tom }
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
