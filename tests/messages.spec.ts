import pw from 'next/experimental/testmode/playwright'

const { test, expect } = pw

import messages from './data/messages.json' assert { type: 'json' }

test.beforeEach(async ({ context, next }) => {
    await context.addCookies([
        {
            name: 'api-token',
            value: 'playwright-test-token',
            url: 'http://localhost:3000',
        },
    ])

    next.onFetch((request) => {
        const url = new URL(request.url)

        if (request.method === 'GET' && url.pathname === '/api/messages') {
            return new Response(JSON.stringify(messages.data), {
                status: 200,
                headers: { 'content-type': 'application/json' },
            })
        }

        return 'continue'
    })
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

    await page.waitForLoadState('networkidle')
})

test('filter by topics', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()
    await expect(page).toHaveURL(/direction=DESC/)

    await page.getByRole('combobox').first().fill('helved.avstemming.v1')
    await page.getByRole('option').first().click()
    await expect(page).toHaveURL(/topics=helved.avstemming.v1/g)

    await page.waitForLoadState('networkidle')
})

test('filter by key', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()
    await expect(page).toHaveURL(/direction=DESC/)

    await page.getByRole('textbox').nth(1).fill('some-key')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/key=some-key/g)

    await page.waitForLoadState('networkidle')
})

test('filter by value', async ({ page }) => {
    await page.goto(`http://localhost:3000/kafka`)
    const loading = page.locator("[data-testid='messages-table-skeleton']")
    await expect(loading).toBeHidden()
    await expect(page).toHaveURL(/direction=DESC/)

    await page.getByRole('combobox').nth(3).fill('mmel')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/value=mmel/g)

    await page.waitForLoadState('networkidle')
})
