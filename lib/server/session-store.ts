import { randomUUID } from 'crypto'
import { getValkeyClient } from '@/lib/server/valkey.ts'

export type TokenSession = {
    'api-token': string
    'utsjekk-api-token': string
    'vedskiva-api-token': string
    'speiderhytta-api-token'?: string
}

export async function createSession(tokens: TokenSession, ttlSeconds: number): Promise<string> {
    const sessionId = randomUUID()
    const client = await getValkeyClient()
    await client.set(sessionId, JSON.stringify(tokens), 'EX', ttlSeconds)
    return sessionId
}

export async function getSession(sessionId: string): Promise<TokenSession | null> {
    const client = await getValkeyClient()
    const data = await client.get(sessionId)
    if (!data) return null
    return JSON.parse(data) as TokenSession
}

export async function deleteSession(sessionId: string): Promise<void> {
    const client = await getValkeyClient()
    await client.del(sessionId)
}
