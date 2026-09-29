import { describe, expect, it } from 'vitest'
import { parseAuditLogPayload } from '@/app/audit/logs/types.ts'

describe('parseAuditLogPayload', () => {
    it('henter felter fra GCP AuditLog', () => {
        const payload = JSON.stringify({
            '@type': 'type.googleapis.com/google.cloud.audit.AuditLog',
            authenticationInfo: { principalEmail: 'ola@nav.no' },
            methodName: 'cloudsql.instances.query',
            resourceName: 'instances/peisschtappern',
            request: { statement: 'SELECT 1', user: 'db-user' },
        })

        expect(parseAuditLogPayload(payload)).toMatchObject({
            principal: 'ola@nav.no',
            method: 'cloudsql.instances.query',
            resource: 'instances/peisschtappern',
            statement: 'SELECT 1',
        })
    })

    it('faller tilbake på pgaudit-felter i request', () => {
        const payload = JSON.stringify({ request: { user: 'db-user', command: 'UPDATE', database: 'peis' } })
        expect(parseAuditLogPayload(payload)).toMatchObject({ principal: 'db-user', method: 'UPDATE', resource: 'peis' })
    })

    it('håndterer tekst-payload', () => {
        expect(parseAuditLogPayload('ikke json')).toEqual({
            principal: null,
            method: null,
            resource: null,
            statement: null,
            json: null,
        })
    })
})
