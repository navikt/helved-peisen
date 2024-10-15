import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './fakes/setup.ts',
        exclude: [...configDefaults.exclude, 'tests/*'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
})
