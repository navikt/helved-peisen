import { existsSync, readFileSync, writeFileSync } from 'fs'

const envPath = '.env.local'

export const updateEnvFile = (entries: Record<string, string>) => {
    let content = existsSync(envPath) ? readFileSync(envPath, 'utf-8') : ''
    const existing: Record<string, string> = Object.fromEntries(
        content.split('\n').map((it) => it.split('='))
    )

    for (const [key, value] of Object.entries(entries)) {
        existing[key] = value
    }

    writeFileSync(
        envPath,
        Object.entries(existing)
            .map((it) => it.join('='))
            .join('\n')
    )
}
