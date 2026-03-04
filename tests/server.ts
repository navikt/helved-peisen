import express from 'express'
import messages from './data/messages.json' with { type: 'json' }
import { requireEnv } from '../lib/env.ts'

import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true })

const url = new URL(requireEnv('API_BASE_URL'))
const app = express()
const port = Number(url.port || (url.protocol === 'https:' ? '443' : '80'))

app.get('/', (_req, res) => {
    res.send('ok')
})

app.get('/api/messages', (_req, res) => {
    console.log('MOCKING MESSAGES')
    res.send(JSON.stringify(messages.data))
})

app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`)
})
