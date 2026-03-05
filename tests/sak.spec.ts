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
