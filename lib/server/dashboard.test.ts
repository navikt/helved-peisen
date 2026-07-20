import { describe, expect, it } from 'vitest'
import type { RawMessage } from '@/app/kafka/types.ts'
import type { DataMelding } from '@/app/avstemming/types.ts'
import {
    computeAvstemmingStatus,
    countPendingMismatch,
    findDobbeltutbetalinger,
    findManglendeKvittering,
} from '@/lib/server/dashboard.ts'

function rawMessage(overrides: Partial<RawMessage>): RawMessage {
    return {
        version: '1',
        topic_name: 'helved.utbetalinger.v1',
        key: 'key-1',
        value: null,
        partition: 0,
        offset: 0,
        timestamp_ms: 0,
        stream_time_ms: 0,
        system_time_ms: 0,
        trace_id: 'trace-1',
        sakId: null,
        fagsystem: null,
        status: null,
        ...overrides,
    }
}

describe('countPendingMismatch', () => {
    it('counts utbetalinger without a matching preceding pending-utbetaling', () => {
        const pending = rawMessage({
            topic_name: 'helved.pending-utbetalinger.v1',
            key: 'uid-1',
            system_time_ms: 100,
            value: JSON.stringify({ uid: 'uid-1', lastPeriodeId: 'p1', perioder: [{ fom: '2024-01-01', tom: '2024-01-31', beløp: 100 }] }),
        })
        const mismatchedUtbetaling = rawMessage({
            topic_name: 'helved.utbetalinger.v1',
            key: 'uid-1',
            system_time_ms: 200,
            value: JSON.stringify({ uid: 'uid-1', lastPeriodeId: 'p1', perioder: [{ fom: '2024-01-01', tom: '2024-01-31', beløp: 200 }] }),
        })

        const summary = countPendingMismatch([pending, mismatchedUtbetaling])

        expect(summary.count).toBe(1)
        expect(summary.sampleKeys).toEqual(['uid-1'])
    })

    it('does not flag utbetalinger that match their preceding pending-utbetaling', () => {
        const perioder = [{ fom: '2024-01-01', tom: '2024-01-31', beløp: 100 }]
        const pending = rawMessage({
            topic_name: 'helved.pending-utbetalinger.v1',
            key: 'uid-2',
            system_time_ms: 100,
            value: JSON.stringify({ uid: 'uid-2', lastPeriodeId: 'p1', perioder }),
        })
        const utbetaling = rawMessage({
            topic_name: 'helved.utbetalinger.v1',
            key: 'uid-2',
            system_time_ms: 200,
            value: JSON.stringify({ uid: 'uid-2', lastPeriodeId: 'p1', perioder }),
        })

        const summary = countPendingMismatch([pending, utbetaling])

        expect(summary.count).toBe(0)
        expect(summary.sampleKeys).toEqual([])
    })
})

function dataMelding(overrides: Partial<DataMelding['aksjon']> & { fom: string; tom: string }): {
    fagsystem: string
    avstemming: DataMelding
} {
    const fagsystem = overrides.avleverendeKomponentKode ?? 'TS'
    return {
        fagsystem,
        avstemming: {
            aksjon: {
                aksjonType: 'DATA',
                kildeType: 'AVLEV',
                avstemmingType: 'PERIODISK',
                avleverendeKomponentKode: fagsystem,
                mottakendeKomponentKode: 'OS',
                underkomponentKode: fagsystem,
                nokkelFom: overrides.fom,
                nokkelTom: overrides.tom,
                tidspunktAvstemmingTom: null,
                avleverendeAvstemmingId: '1',
                brukerId: 'peisen',
            },
            total: { totalAntall: 1, totalBelop: 100, fortegn: 'T' },
            periode: { datoAvstemtFom: overrides.fom, datoAvstemtTom: overrides.tom },
            grunnlag: {
                godkjentAntall: 1,
                godkjentBelop: 100,
                varselAntall: 0,
                varselBelop: 0,
                avvistAntall: 0,
                avvistBelop: 0,
                manglerAntall: 0,
                manglerBelop: 0,
            },
        },
    }
}

describe('computeAvstemmingStatus', () => {
    it('marks fagsystem as having run when a datamelding covers the reference date', () => {
        const referenceDate = new Date('2024-05-02T00:00:00Z')
        const meldinger = [dataMelding({ avleverendeKomponentKode: 'TS', fom: '2024-05-02', tom: '2024-05-02' })]

        const status = computeAvstemmingStatus(meldinger, ['TS', 'DP'], referenceDate)

        expect(status).toEqual([
            {
                fagsystem: 'TS',
                harKjort: true,
                datoAvstemtFom: '2024-05-02',
                datoAvstemtTom: '2024-05-02',
                sisteAvstemtDato: '2024-05-02',
            },
            { fagsystem: 'DP', harKjort: false, datoAvstemtFom: null, datoAvstemtTom: null, sisteAvstemtDato: null },
        ])
    })

    it('reports the last known avstemt date even when it does not cover the reference date', () => {
        const referenceDate = new Date('2024-05-02T00:00:00Z')
        const meldinger = [dataMelding({ avleverendeKomponentKode: 'TS', fom: '2024-04-28', tom: '2024-04-28' })]

        const status = computeAvstemmingStatus(meldinger, ['TS'], referenceDate)

        expect(status).toEqual([
            {
                fagsystem: 'TS',
                harKjort: false,
                datoAvstemtFom: null,
                datoAvstemtTom: null,
                sisteAvstemtDato: '2024-04-28',
            },
        ])
    })
})

describe('findManglendeKvittering', () => {
    const oneHourMs = 60 * 60 * 1000

    it('flags oppdrag messages without a matching status message older than the threshold', () => {
        const oppdrag = rawMessage({
            topic_name: 'helved.oppdrag.v1',
            key: 'oppdrag-1',
            trace_id: 'trace-1',
            system_time_ms: 0,
        })

        const manglende = findManglendeKvittering([oppdrag], [], oneHourMs + 1, oneHourMs)

        expect(manglende).toHaveLength(1)
        expect(manglende[0].key).toBe('oppdrag-1')
    })

    it('does not flag oppdrag messages that have a matching status message', () => {
        const oppdrag = rawMessage({ topic_name: 'helved.oppdrag.v1', key: 'oppdrag-2', system_time_ms: 0 })
        const status = rawMessage({ topic_name: 'helved.status.v1', key: 'oppdrag-2', system_time_ms: 10 })

        const manglende = findManglendeKvittering([oppdrag], [status], oneHourMs + 1, oneHourMs)

        expect(manglende).toHaveLength(0)
    })

    it('does not flag oppdrag messages that are younger than the threshold', () => {
        const oppdrag = rawMessage({ topic_name: 'helved.oppdrag.v1', key: 'oppdrag-3', system_time_ms: 0 })

        const manglende = findManglendeKvittering([oppdrag], [], oneHourMs - 1, oneHourMs)

        expect(manglende).toHaveLength(0)
    })
})

describe('findDobbeltutbetalinger', () => {
    const statusValue = (linjer: { behandlingId: string; fom: string; tom: string; beløp: number; klassekode: string }[]) =>
        JSON.stringify({ status: 'OK', detaljer: { ytelse: 'TILLEGGSSTØNADER', linjer } })

    it('flags the same period/behandlingId/klassekode paid via two different messages', () => {
        const linje = { behandlingId: 'b1', fom: '2024-01-01', tom: '2024-01-31', beløp: 1000, klassekode: 'TSTBASISP4-OP' }

        const messageA = rawMessage({
            topic_name: 'helved.status.v1',
            key: 'k1',
            offset: 1,
            system_time_ms: 100,
            value: statusValue([linje]),
        })
        const messageB = rawMessage({
            topic_name: 'helved.status.v1',
            key: 'k2',
            offset: 2,
            system_time_ms: 200,
            value: statusValue([linje]),
        })

        const candidates = findDobbeltutbetalinger([messageA, messageB])

        expect(candidates).toHaveLength(1)
        expect(candidates[0]).toMatchObject({ behandlingId: 'b1', klassekode: 'TSTBASISP4-OP', fom: '2024-01-01', tom: '2024-01-31' })
        expect(candidates[0].kilder).toHaveLength(2)
    })

    it('does not flag different periods for the same behandlingId/klassekode', () => {
        const messageA = rawMessage({
            topic_name: 'helved.status.v1',
            key: 'k1',
            offset: 1,
            value: statusValue([{ behandlingId: 'b1', fom: '2024-01-01', tom: '2024-01-31', beløp: 1000, klassekode: 'TSTBASISP4-OP' }]),
        })
        const messageB = rawMessage({
            topic_name: 'helved.status.v1',
            key: 'k2',
            offset: 2,
            value: statusValue([{ behandlingId: 'b1', fom: '2024-02-01', tom: '2024-02-29', beløp: 1000, klassekode: 'TSTBASISP4-OP' }]),
        })

        expect(findDobbeltutbetalinger([messageA, messageB])).toHaveLength(0)
    })

    it('ignores repeated linjer coming from the same message', () => {
        const linje = { behandlingId: 'b1', fom: '2024-01-01', tom: '2024-01-31', beløp: 1000, klassekode: 'TSTBASISP4-OP' }
        const message = rawMessage({
            topic_name: 'helved.status.v1',
            key: 'k1',
            offset: 1,
            value: statusValue([linje, linje]),
        })

        expect(findDobbeltutbetalinger([message])).toHaveLength(0)
    })

    it('ignores non-OK statuses', () => {
        const message = rawMessage({
            topic_name: 'helved.status.v1',
            key: 'k1',
            offset: 1,
            value: JSON.stringify({ status: 'FEILET', error: { statusCode: 500, msg: 'feil', doc: '' } }),
        })

        expect(findDobbeltutbetalinger([message])).toHaveLength(0)
    })
})
