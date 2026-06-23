import { GlideClient, TimeUnit } from '@valkey/valkey-glide'

type SessionValue = string | null

interface SessionClient {
    get(key: string): Promise<SessionValue>
    set(key: string, value: string, expiryMode: 'EX', ttl: number): Promise<unknown>
    del(key: string): Promise<unknown>
}

class InMemorySessionClient implements SessionClient {
    private store = new Map<string, { value: string; expiresAt: number }>()

    async get(key: string): Promise<SessionValue> {
        const entry = this.store.get(key)
        if (!entry) return null
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key)
            return null
        }
        return entry.value
    }

    async set(key: string, value: string, _expiryMode: 'EX', ttl: number): Promise<unknown> {
        this.store.set(key, { value, expiresAt: Date.now() + ttl * 1000 })
        return 'OK'
    }

    async del(key: string): Promise<unknown> {
        this.store.delete(key)
        return 1
    }
}

let client: SessionClient | null = null

function parseAddress(uri: string): { host: string; port: number } {
    const url = new URL(uri)
    return { host: url.hostname, port: Number(url.port) || 6379 }
}

export async function getValkeyClient(): Promise<SessionClient> {
    if (client) return client

    const uri = process.env.VALKEY_URI_PEISEN_SESSIONS

    if (!uri) {
        console.log('[valkey] VALKEY_URI_SESSIONS not set, using in-memory session store')
        client = new InMemorySessionClient()
        return client
    }

    const { host, port } = parseAddress(uri)
    const useTls = uri.startsWith('valkeys://') || uri.startsWith('rediss://')

    try {
        const glide = await GlideClient.createClient({
            addresses: [{ host, port }],
            useTLS: useTls,
        })

        console.log(`[valkey] Connected to ${host}:${port}`)

        client = {
            get: (key) => glide.get(key) as Promise<string | null>,
            set: (key, value, _mode, ttl) =>
                glide.set(key, value, { expiry: { type: TimeUnit.Seconds, count: ttl } }),
            del: (key) => glide.del([key]),
        }
    } catch (err) {
        console.error('[valkey] Failed to connect:', err instanceof Error ? err.message : err)
        client = new InMemorySessionClient()
    }

    return client
}
