import { defineConfig, devices } from '@playwright/test'

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { requireEnv } from './lib/env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true })
const testEnv = { ...process.env } as { [key: string]: string }
const fakeBackendUrl = requireEnv('API_BASE_URL')
const appUrl = requireEnv('NEXT_PUBLIC_HOSTNAME')

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: !process.env.CI,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        locale: 'nb-NO',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            command: 'node --experimental-strip-types tests/server.ts',
            url: fakeBackendUrl,
            reuseExistingServer: false,
            env: testEnv,
            timeout: 10 * 1000,
        },
        {
            command: 'pnpm run dev',
            url: appUrl,
            reuseExistingServer: false,
            env: testEnv,
            timeout: 10 * 1000,
        },
    ],
})
