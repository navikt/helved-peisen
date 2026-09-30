import { describe, expect, it } from 'vitest'
import { parseAuditLogMessage, parseAuditLogPayload } from '@/app/audit/logs/types.ts'

const MESSAGE =
    'name:"Tester, Test" email:"Tester.Test@nav.no" ident:"S1234567" reason:Har blitt kvittert OK av OS. Tok lang tid å sette status, trolig på grunn av Ktor 3.5.0. Oppgave #552 -> send OK status manuelt -> key:e19db159-ff06-4d1f-985a-8235835fcaf3 fagsystem:TILLEGGSSTØNADER topic:helved.status.v1 partition:0 offset:267650'

describe('parseAuditLogMessage', () => {
    it('parser alle felter', () => {
        expect(parseAuditLogMessage(MESSAGE)).toEqual({
            name: 'Tester, Test',
            email: 'Tester.Test@nav.no',
            ident: 'S1234567',
            reason: 'Har blitt kvittert OK av OS. Tok lang tid å sette status, trolig på grunn av Ktor 3.5.0. Oppgave #552',
            action: 'send OK status manuelt',
            details: {
                key: 'e19db159-ff06-4d1f-985a-8235835fcaf3',
                fagsystem: 'TILLEGGSSTØNADER',
                topic: 'helved.status.v1',
                partition: '0',
                offset: '267650',
            },
        })
    })

    it('tåler "->" og kolon i årsaken', () => {
        const msg = 'name:"A" email:"a@nav.no" ident:"X1" reason:feil: A -> B -> tombstone -> key:abc topic:t'
        expect(parseAuditLogMessage(msg)).toMatchObject({
            reason: 'feil: A -> B',
            action: 'tombstone',
            details: { key: 'abc', topic: 't' },
        })
    })

    it('parser melding uten reason', () => {
        const msg =
            'name:"Tester, Test" email:"Tester.Test@nav.no" ident:"S1234567" -> flytt pending til utbetalinger manuelt -> key:abc-123 topic:helved.utbetalinger.v1 partition:0 offset:42'
        expect(parseAuditLogMessage(msg)).toEqual({
            name: 'Tester, Test',
            email: 'Tester.Test@nav.no',
            ident: 'S1234567',
            reason: null,
            action: 'flytt pending til utbetalinger manuelt',
            details: {
                key: 'abc-123',
                topic: 'helved.utbetalinger.v1',
                partition: '0',
                offset: '42',
            },
        })
    })

    it('parser header-verdier uten anførselstegn', () => {
        const msg =
            'name:Tester, Test email:Tester.Test@nav.no ident:S1234567 reason:Mangler sistePeriode. Oppgave #624 -> endret utbetaling manuelt -> key:710c4794-31c1-4f5c-ba5d-14293f50a966 topic:helved.utbetalinger.v1 partition:1 offset:25794'
        expect(parseAuditLogMessage(msg)).toEqual({
            name: 'Tester, Test',
            email: 'Tester.Test@nav.no',
            ident: 'S1234567',
            reason: 'Mangler sistePeriode. Oppgave #624',
            action: 'endret utbetaling manuelt',
            details: {
                key: '710c4794-31c1-4f5c-ba5d-14293f50a966',
                topic: 'helved.utbetalinger.v1',
                partition: '1',
                offset: '25794',
            },
        })
    })

    it('returnerer null for ukjent format', () => {
        expect(parseAuditLogMessage('noe helt annet')).toBeNull()
    })
})

describe('parseAuditLogPayload', () => {
    it('leser message fra jsonPayload', () => {
        const parsed = parseAuditLogPayload(JSON.stringify({ message: MESSAGE, level: 'INFO' }))
        expect(parsed.message?.ident).toBe('S1234567')
        expect(parsed.json).toMatchObject({ level: 'INFO' })
    })

    it('leser message fra tekst-payload', () => {
        expect(parseAuditLogPayload(MESSAGE).message?.action).toBe('send OK status manuelt')
    })
})
