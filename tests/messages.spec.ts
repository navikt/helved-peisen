import { expect, type Page, test } from '@playwright/test'
import { parse } from 'date-fns'

const getTimestamps = async (page: Page) => {
    const values = await page.locator('table tbody tr').evaluateAll((trs) =>
        trs
            .map((tr) => {
                return tr.querySelectorAll('td')[3]?.textContent?.trim() || ''
            })
            .filter((it) => it !== '')
    )

    return values.map((it) => parse(it, 'yyyy-MM-dd - HH:mm:ss.SSS', new Date()).getTime())
}

const expectSortedDescending = (timestamps: number[]) => {
    for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i + 1])
    }
}

const expectSortedAscending = (timestamps: number[]) => {
    for (let i = 0; i < timestamps.length - 1; i++) {
        expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i + 1])
    }
}

test('messages are sorted by timestamp', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)

    const loading = page.locator('[data-testid="messages-table-skeleton"]')
    await expect(loading).toBeHidden()

    expectSortedDescending(await getTimestamps(page))

    await page.click('text=Timestamp')
    expectSortedAscending(await getTimestamps(page))
})

test('show only latest messages', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)

    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await expect(page.locator('text=Viser meldinger 1 - 100 av 231')).toBeVisible()
    await page.click('text=Siste')
    await expect(page.locator('text=Viser meldinger 1 - 100 av 118')).toBeVisible()
})

test('filter by topics', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)

    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await expect(page.locator('text=Viser meldinger 1 - 100 av 231')).toBeVisible()
    await page.getByRole('combobox').first().fill('helved.avstemming.v1')
    await page.getByRole('option').first().click()
    await expect(page.locator('text=Viser meldinger 1 - 6 av 6')).toBeVisible()
})

test('filter by key', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)

    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await expect(page.locator('text=Viser meldinger 1 - 100 av 231')).toBeVisible()
    await page.getByRole('textbox').nth(1).fill('e0938c7c-ddf3-4b39-9994-cbee87726ebd')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Viser meldinger 1 - 5 av 5')).toBeVisible()
})

test('filter by value', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)

    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await expect(page.locator('text=Viser meldinger 1 - 100 av 231')).toBeVisible()
    await page.getByRole('combobox').nth(1).fill('mmel')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Viser meldinger 1 - 78 av 78')).toBeVisible()
})

test('go to sak', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)

    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await page.locator('table tbody tr').first().locator('td').last().getByRole('button').click()

    const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        page.getByText('Gå til sak').click()
    ])

    await newPage.waitForLoadState()
    await expect(newPage).toHaveURL(/\/sak\?sakId=AS-TILLST-2510010908&fagsystem=TILLST/)
})
