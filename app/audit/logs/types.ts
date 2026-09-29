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

export type ParsedAuditLog = {
    principal: string | null
    method: string | null
    resource: string | null
    statement: string | null
    json: unknown | null
}

type AnyRecord = Record<string, unknown>

const str = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null)
const obj = (value: unknown): AnyRecord | null =>
    value && typeof value === 'object' && !Array.isArray(value) ? (value as AnyRecord) : null

export function parseAuditLogPayload(payload: string): ParsedAuditLog {
    let json: unknown = null
    try {
        json = JSON.parse(payload)
    } catch {
        return { principal: null, method: null, resource: null, statement: null, json: null }
    }

    const root = obj(json) ?? {}
    const auth = obj(root.authenticationInfo)
    const request = obj(root.request)

    return {
        principal: str(auth?.principalEmail) ?? str(request?.user) ?? str(root.user),
        method: str(root.methodName) ?? str(request?.command) ?? str(root.command),
        resource: str(root.resourceName) ?? str(request?.database) ?? str(root.database),
        statement: str(request?.statement) ?? str(root.statement),
        json,
    }
}
