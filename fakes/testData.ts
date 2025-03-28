import { randomUUID } from 'node:crypto'
import { addDays, subDays } from 'date-fns'

type Message = {
    key: string
    timestamp: string
    data: string
}

function randomDate(dayRange: number) {
    const today = new Date()
    const startDate = subDays(today, dayRange)
    const endDate = addDays(today, dayRange)

    const randomTime =
        startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    return new Date(randomTime)
}

export const TestData = {
    oppdrag() {
        return {
            mmel: null,
            oppdrag110: {
                kodeAksjon: '1',
                kodeEndring: 'NY',
                kodeStatus: null,
                datoStatusFom: null,
                kodeFagomraade: 'TILLST',
                fagsystemId: '2412200956',
                oppdragsId: null,
                utbetFrekvens: 'MND',
                datoForfall: null,
                stonadId: null,
                oppdragGjelderId: '15898099536',
                datoOppdragGjelderFom: '1999-12-31T23:00:00.000+00:00',
                saksbehId: 'A111111',
                oppdragsStatus111S: null,
                oppdragGjelder112S: null,
                bilagstype113: null,
                avstemming115: {
                    kodeKomponent: 'TILLST',
                    nokkelAvstemming: '2024-12-20-09.00.00.000000',
                    tidspktMelding: '2024-12-20-09.00.00.000000',
                },
                ompostering116: null,
                avvent118: null,
                oppdragsEnhet120S: [
                    {
                        typeEnhet: 'BOS',
                        enhet: '8020',
                        datoEnhetFom: '1899-12-31T23:00:00.000+00:00',
                    },
                ],
                belopsGrense130S: null,
                tekst140S: null,
                oppdragsLinje150S: [
                    {
                        kodeEndringLinje: 'NY',
                        kodeStatusLinje: null,
                        datoStatusFom: null,
                        vedtakId: '2024-12-04',
                        delytelseId: '2412200956#1',
                        linjeId: null,
                        kodeKlassifik: 'TSTBASISP4-OP',
                        datoKlassifikFom: null,
                        datoVedtakFom: '2024-12-01T23:00:00.000+00:00',
                        datoVedtakTom: '2024-12-02T23:00:00.000+00:00',
                        sats: 500,
                        fradragTillegg: 'T',
                        typeSats: 'DAG',
                        skyldnerId: null,
                        datoSkyldnerFom: null,
                        kravhaverId: null,
                        datoKravhaverFom: null,
                        kid: null,
                        datoKidFom: null,
                        brukKjoreplan: 'N',
                        saksbehId: 'A111111',
                        utbetalesTilId: '15898099536',
                        datoUtbetalesTilIdFom: null,
                        kodeArbeidsgiver: null,
                        henvisning: '1',
                        typeSoknad: null,
                        refFagsystemId: null,
                        refOppdragsId: null,
                        refDelytelseId: null,
                        refLinjeId: null,
                        linjeStatus151S: null,
                        klassifikasjon152S: null,
                        skyldner153S: null,
                        kid154S: null,
                        utbetalesTil155S: null,
                        refusjonsinfo156: null,
                        vedtakssats157: null,
                        linjeTekst158S: null,
                        linjeEnhet160S: null,
                        grad170S: null,
                        attestant180S: [
                            { attestantId: 'A111111', datoUgyldigFom: null },
                        ],
                        valuta190S: null,
                    },
                ],
            },
            hentOppdrag195: null,
            simuleringsPeriode300: null,
            simuleringsResultat301: null,
            avstemming610: null,
        }
    },
    message(overrides?: Partial<Message>): Message {
        return {
            key: randomUUID(),
            timestamp: new Date().toISOString(),
            data: '',
            ...overrides,
        }
    },
    messages(size = Math.ceil(Math.random() * 100)): Message[] {
        return new Array(size).fill(null).map((_) => this.message())
    },
    messagesByTopic(): Record<string, Message[]> {
        return {
            'helved.oppdrag.v1': this.messages(),
            'helved.simuleringer.v1': this.messages(),
            'helved.dryrun-aap.v1': this.messages(),
            'helved.dryrun-ts.v1': this.messages(),
            'helved.dryrun-tp.v1': this.messages(),
            'helved.kvittering.v1': this.messages(),
            'helved.status.v1': this.messages(),
            'helved.kvittering-queue.v1': this.messages(),
        }
    },
    taskStatus(): TaskStatus {
        const random = Math.random()
        switch (true) {
            case random < 0.75:
                return 'COMPLETE'
            case random < 0.95:
                return 'IN_PROGRESS'
            case random < 0.99:
                return 'FAIL'
            default:
                return 'MANUAL'
        }
    },
    taskKind(): TaskKind {
        const random = Math.random()
        switch (true) {
            case random < 0.1:
                return 'Avstemming'
            case random < 0.55:
                return 'Iverksetting'
            default:
                return 'SjekkStatus'
        }
    },
    task(
        status: TaskStatus = TestData.taskStatus(),
        kind: TaskKind = TestData.taskKind()
    ): Task {
        return {
            id: randomUUID(),
            payload: '',
            status: status,
            attempt: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            scheduledFor: randomDate(10).toISOString(),
            kind: kind,
            metadata: {
                sakId: randomUUID(),
                behandlingId: randomUUID(),
                iverksettingId: randomUUID(),
            },
        }
    },
    tasks(n: number): Task[] {
        return new Array(n).fill(null).map((_) => TestData.task())
    },
    taskHistory(taskId: string): TaskHistory[] {
        return [
            {
                id: randomUUID(),
                taskId: taskId,
                createdAt: new Date().toISOString(),
                triggeredAt: new Date().toISOString(),
                triggeredBy: new Date().toISOString(),
                status: 'COMPLETE',
            },
            {
                id: randomUUID(),
                taskId: taskId,
                createdAt: new Date().toISOString(),
                triggeredAt: new Date().toISOString(),
                triggeredBy: new Date().toISOString(),
                status: 'IN_PROGRESS',
            },
        ]
    },
}
