import { defineConfig, devices } from '@playwright/test'

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env.test') })
const testEnv = { ...process.env } as { [key: string]: string }

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://127.0.0.1:3000',
        trace: 'on-first-retry',
        locale: "nb-NO"
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run fake & npx next dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        env: testEnv,
    },
})
