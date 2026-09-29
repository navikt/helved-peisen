export type AuditLogEntry = {
    timestamp: string
    severity: string
    logName: string
    payload: string
}

export type AuditLogPage = {
    entries: AuditLogEntry[]
    nextPageToken: string | null
}

export type AuditLogMessage = {
    name: string | null
    email: string | null
    ident: string | null
    reason: string | null
    action: string | null
    details: Record<string, string>
}

export type ParsedAuditLog = {
    message: AuditLogMessage | null
    json: unknown | null
}

const SEPARATOR = ' -> '

const quoted = (text: string, field: string): string | null => text.match(new RegExp(`${field}:"([^"]*)"`))?.[1] ?? null

// Format: name:"..." email:"..." ident:"..." reason:<fritekst> -> <handling> -> key:... fagsystem:... topic:...
export function parseAuditLogMessage(message: string): AuditLogMessage | null {
    const reasonIndex = message.indexOf('reason:')
    if (reasonIndex === -1) return null

    const header = message.slice(0, reasonIndex)
    const segments = message.slice(reasonIndex + 'reason:'.length).split(SEPARATOR)

    // Årsaken er fritekst og kan selv inneholde "->", så handling og detaljer leses bakfra
    let details: Record<string, string> = {}
    const last = segments.at(-1) ?? ''
    if (segments.length > 1 && /^\s*\w+:\S/.test(last)) {
        details = Object.fromEntries([...last.matchAll(/(\w+):(\S+)/g)].map(([, key, value]) => [key, value]))
        segments.pop()
    }
    const action = segments.length > 1 ? segments.pop()!.trim() : null
    const reason = segments.join(SEPARATOR).trim()

    return {
        name: quoted(header, 'name'),
        email: quoted(header, 'email'),
        ident: quoted(header, 'ident'),
        reason: reason || null,
        action: action || null,
        details,
    }
}

export function parseAuditLogPayload(payload: string): ParsedAuditLog {
    let json: unknown = null
    try {
        json = JSON.parse(payload)
    } catch {
        return { message: parseAuditLogMessage(payload), json: null }
    }

    const message =
        json && typeof json === 'object' && 'message' in json && typeof json.message === 'string' ? json.message : null

    return { message: message ? parseAuditLogMessage(message) : null, json }
}
