import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from './msw/server'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import dotenv from 'dotenv'

const result = dotenv.config({ path: "./.env.test"});

if (result.error) {
    console.error('Error loading .env file:', result.error);
}

beforeAll(() => {
    server.listen()
})

afterEach(() => {
    server.resetHandlers()
    cleanup()
})

afterAll(() => {
    server.close()
})

const searchParams = () => ({
    get: () => "",
})

vi.mock('next/navigation', () => {
    const actual = vi.importActual('next/navigation')
    return {
        ...actual,
        useRouter: vi.fn(() => ({
            push: vi.fn(),
        })),
        useSearchParams: searchParams,
        usePathname: vi.fn(),
    }
})

vi.mock('next/headers', () => {
    const actual = vi.importActual('next/headers')
    return {
        ...actual,
        cookies: vi.fn(() => ({
            get: vi.fn(),
            set: vi.fn(),
        })),
    }
})
