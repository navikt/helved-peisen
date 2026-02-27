import test, { expect } from '@playwright/test'
import messages from '@/tests/data/messages.json' assert { type: 'json' }
import { sleep } from '@/fakes/util.ts'

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
    await page.route(
        (url) => url.pathname.includes('/api/saker'),
        (route) =>
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: messages.data.items.slice(0, 10), error: null }),
            })
    )
})

test('navigate to sak', async ({ page, context }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator('[data-testid="messages-table-skeleton"]')
    await expect(loading).toBeHidden()

    await page.locator('tr', { hasText: 'helved.oppdrag.v1' }).getByRole('button').nth(1).click()

    const newTab = context.waitForEvent('page')
    await page.getByRole('link', { name: 'Gå til sak' }).click()
    const newPage = await newTab

    await expect(newPage).toHaveURL(/sak\?sakId=(?=.*[?&]fagsystem=).*/)
})
