import { expect } from '@playwright/test'
import { deslugify } from '@/lib/string.ts'

const clickCombobox = async (text: string, page) => {
    const button = page.getByText(text).first()
    await button.click()
}

const clickOption = async (text: string, page) => {
    const option = page.getByRole('option').filter({ hasText: text })
    await option.isVisible()
    await option.click()
}

export const waitForTasksToLoad = async (page) => {
    await page.getByText('Rekjør').first().waitFor({ state: 'visible' })
}

export const selectStatus = async (status: TaskStatus, page) => {
    await clickCombobox('Status', page)
    await clickOption(deslugify(status), page)

    const button = page.getByRole('button', { name: deslugify(status) })
    await expect(button).toBeVisible()
    await page.keyboard.press('Escape')
}

export const expectStatuses = (expected: TaskStatus[], page) => {
    let url = new URL(page.url())
    expect(url.searchParams.get('status')).toEqual(expected.join(','))
}

export const deselectStatus = async (status: TaskStatus, page) => {
    const button = page.getByRole('button', { name: status })
    await button.click()
    await expect(button).toHaveCount(0)
}

export const selectType = async (type: TaskKind, page) => {
    await clickCombobox('Type', page)
    await clickOption('Iverksetting', page)
}

export const expectType = (type: TaskKind, page) => {
    let url = new URL(page.url())
    expect(url.searchParams.get('kind')).toEqual(type)
}
