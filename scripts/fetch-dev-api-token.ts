import { chromium } from '@playwright/test'
import { requireEnv } from '../lib/env.ts'
import { updateEnvFile } from './update-env-file.ts'
import dotenv from 'dotenv'

const result = dotenv.config({ path: "./.env.local"});

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

export async function fetchDevApiToken() {
    const browser = await chromium.launch({ headless: false })
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(
        'https://azure-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp.helved.peisschtappern'
    )
    await page
        .getByRole('textbox', { name: 'Log inn med din Trygdeetaten' })
        .click()
    await page
        .getByRole('textbox', { name: 'Log inn med din Trygdeetaten' })
        .fill(requireEnv('TEST_USER_USERNAME'))
    await page.getByRole('button', { name: 'Next' }).click()
    await page.getByRole('textbox', { name: 'Enter the password for' }).click()
    await page
        .getByRole('textbox', { name: 'Enter the password for' })
        .fill(requireEnv('TEST_USER_PASSWORD'))
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('button', { name: 'No' }).click()
    await page.getByText('{ "access_token" : "').isVisible()

    const text =
        (await page.getByText('{ "access_token" : "').textContent()) ?? ''
    const json = JSON.parse(text)

    await browser.close()

    updateEnvFile({ API_TOKEN: json.access_token })
}

await fetchDevApiToken()
