import { describe, expect, it } from 'vitest'

import { parseDatabaseAuditLog } from '@/app/audit/database-logs/types.ts'

const LOG = {
    timestamp: '2026-06-16T12:45:13.031Z',
    severity: 'INFO',
    protoPayload: {
        request: {
            command: 'UPDATE',
            database: 'utsjekk',
            user: 'Test.Testersen@nav.no',
            statement: 'UPDATE public.utbetaling SET deleted_at = $1 WHERE id = $2',
        },
    },
}

describe('parseDatabaseAuditLog', () => {
    it('leser feltene fra en strukturert loggoppføring', () => {
        expect(parseDatabaseAuditLog(LOG)).toMatchObject({
            timestamp: '2026-06-16T12:45:13.031Z',
            severity: 'INFO',
            command: 'UPDATE',
            database: 'utsjekk',
            user: 'Test.Testersen@nav.no',
        })
    })

    it('leser feltene når loggen ligger som JSON i payload', () => {
        expect(parseDatabaseAuditLog({ payload: JSON.stringify(LOG) })).toMatchObject({
            severity: 'INFO',
            command: 'UPDATE',
            database: 'utsjekk',
        })
    })
})
