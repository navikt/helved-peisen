import test, { expect } from '@playwright/test'
import messages from './data/messages.json' assert { type: 'json' }

test.beforeEach(async ({ page }) => {
    await page.route(
        (url) => url.pathname === '/api/messages',
        (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(messages),
            })
    )
})

test('messages are sorted by timestamp', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator('[data-testid="messages-table-skeleton"]')
    await expect(loading).toBeHidden()

    await expect(page).toHaveURL(/direction=DESC/)
    await page.getByRole('button', { name: 'Timestamp' }).click()
    await expect(page).toHaveURL(/direction=ASC/)
    await page.getByRole('button', { name: 'Timestamp' }).click()
    await expect(page).not.toHaveURL(/direction=/)
    await page.getByRole('button', { name: 'Timestamp' }).click()
    await expect(page).toHaveURL(/direction=DESC/)
})

test('filter by topics', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await page.getByRole('combobox').first().fill('helved.avstemming.v1')
    await page.getByRole('option').first().click()
    await expect(page).toHaveURL(/topics=helved.avstemming.v1/g)
})

test('filter by key', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await page.getByRole('textbox').nth(1).fill('some-key')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/key=some-key/g)
})

test('filter by value', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()

    await page.getByRole('combobox').nth(2).fill('mmel')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/value=mmel/g)
})
