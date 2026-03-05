import { defineConfig, devices } from '@playwright/test'

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { requireEnv } from './lib/env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true })

export default defineConfig({
    testDir: './tests',
    testMatch: ['**/*.spec.ts'],
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
            command: 'pnpm run dev',
            url: requireEnv('NEXT_PUBLIC_HOSTNAME'),
            reuseExistingServer: false,
            env: process.env as { [key: string]: string },
            timeout: 10 * 1000,
        },
    ],
})
