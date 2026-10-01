export type DatabaseAuditRequest = {
    command?: string
    database?: string
    user?: string
    statement?: string
}

export type CloudSqlAuditLog = {
    timestamp?: string
    severity?: string
    protoPayload?: {
        request?: DatabaseAuditRequest
    }
}

export type DatabaseAuditLogEntry = CloudSqlAuditLog & {
    payload?: string | CloudSqlAuditLog
    [key: string]: unknown
}

export type DatabaseAuditLogPage = {
    entries: DatabaseAuditLogEntry[]
    nextPageToken: string | null
}

export type DatabaseAuditLogDetails = {
    timestamp: string
    severity: string
    command: string
    database: string
    user: string
    statement: string
    json: unknown
}

export function parseDatabaseAuditLog(entry: DatabaseAuditLogEntry): DatabaseAuditLogDetails {
    let log: CloudSqlAuditLog = entry

    if (entry.payload) {
        if (typeof entry.payload === 'string') {
            try {
                log = JSON.parse(entry.payload) as CloudSqlAuditLog
            } catch {
                log = entry
            }
        } else {
            log = entry.payload
        }
    }

    const request = log.protoPayload?.request
    return {
        timestamp: log.timestamp ?? entry.timestamp ?? '',
        severity: log.severity ?? entry.severity ?? '-',
        command: request?.command ?? '-',
        database: request?.database ?? '-',
        user: request?.user ?? '-',
        statement: request?.statement ?? '-',
        json: log,
    }
}
