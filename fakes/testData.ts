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

function randomDateBetween(start: Date, end: Date): Date {
    const startTime = start.getTime()
    const endTime = end.getTime()
    const randomTime = startTime + Math.random() * (endTime - startTime)
    return new Date(randomTime)
}

export const TestData = {
    oppdrag() {
        return {
            mmel: null,
            oppdrag110: {
                kodeAksjon: '1',
                kodeEndring: 'NY',
                kodeFagomraade: 'TILLST',
                fagsystemId: '2412200956',
                utbetFrekvens: 'MND',
                oppdragGjelderId: '15898099536',
                datoOppdragGjelderFom: '1999-12-31T23:00:00.000+00:00',
                saksbehId: 'A111111',
                avstemming115: {
                    kodeKomponent: 'TILLST',
                    nokkelAvstemming: '2024-12-20-09.00.00.000000',
                    tidspktMelding: '2024-12-20-09.00.00.000000',
                },
                oppdragsEnhet120S: [
                    {
                        typeEnhet: 'BOS',
                        enhet: '8020',
                        datoEnhetFom: '1899-12-31T23:00:00.000+00:00',
                    },
                ],
                oppdragsLinje150S: [
                    {
                        kodeEndringLinje: 'NY',
                        vedtakId: '2024-12-04',
                        delytelseId: '2412200956#1',
                        kodeKlassifik: 'TSTBASISP4-OP',
                        datoVedtakFom: '2024-12-01T23:00:00.000+00:00',
                        datoVedtakTom: '2024-12-02T23:00:00.000+00:00',
                        sats: 500,
                        fradragTillegg: 'T',
                        typeSats: 'DAG',
                        brukKjoreplan: 'N',
                        saksbehId: 'A111111',
                        utbetalesTilId: '15898099536',
                        henvisning: '1',
                        attestant180S: [{ attestantId: 'A111111' }],
                    },
                ],
            },
        }
    },
    status() {
        return {
            status: 'OK', // OK, FEILET, MOTTATT, HOS_OPPDRAG
            error: null, // { statusCode: number, msg: string, doc: string }
        }
    },
    simulering() {
        return {
            oppsummeringer: [
                {
                    fom: randomDate(30),
                    tom: randomDate(30),
                    tidligereUtbetalt: 0,
                    nyUtbetaling: 1234,
                    totalEtterbetaling: 0,
                    totalFeilutbetaling: 0,
                },
            ],
            detaljer: {
                gjelderId: '12345678910',
                datoBeregnet: randomDate(30),
                totalBeløp: 1234,
                perioder: [
                    {
                        fom: randomDate(30),
                        tom: randomDate(30),
                        posteringer: [
                            {
                                fagområde: 'TILLST',
                                sakId: 'ABC123',
                                fom: randomDate(30),
                                tom: randomDate(30),
                                beløp: 1234,
                                type: 'YTELSE',
                                klassekode: 'YTEL',
                            },
                        ],
                    },
                ],
            },
        }
    },
    message(
        overrides: Partial<Message> = {},
        options: { fom: Date; tom: Date } = {
            fom: subDays(new Date(), 30),
            tom: new Date(),
        }
    ): Message {
        return {
            key: randomUUID(),
            timestamp: randomDateBetween(
                options.fom,
                options.tom
            ).toISOString(),
            data: '',
            ...overrides,
        }
    },
    messages(
        options: { size?: number; fom: Date; tom: Date } = {
            size: Math.ceil(Math.random() * 100),
            fom: subDays(new Date(), 30),
            tom: new Date(),
        },
        type: 'status' | 'oppdrag' | 'simulering'
    ): Message[] {
        return new Array(options.size ?? Math.ceil(Math.random() * 20))
            .fill(null)
            .map((_) => {
                const data = this[type]()
                return this.message({ data: JSON.stringify(data) }, options)
            })
    },
    messagesByTopic(options?: {
        fom: Date
        tom: Date
    }): Record<string, Message[]> {
        return {
            'helved.oppdrag.v1': this.messages(options, 'oppdrag'),
            'helved.simuleringer.v1': this.messages(options, 'simulering'),
            'helved.dryrun-aap.v1': this.messages(options, 'simulering'),
            'helved.dryrun-ts.v1': this.messages(options, 'simulering'),
            'helved.dryrun-tp.v1': this.messages(options, 'simulering'),
            'helved.kvittering.v1': this.messages(options, 'oppdrag'),
            'helved.status.v1': this.messages(options, 'status'),
            'helved.kvittering-queue.v1': this.messages(options, 'oppdrag'),
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
