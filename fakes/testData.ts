import { randomUUID } from 'node:crypto'
import { addDays, subDays } from 'date-fns'

type Message = {
    version: string
    topic_name: string
    key: string
    value: string | null
    partition: number
    offset: number
    timestamp_ms: number
    stream_time_ms: number
    system_time_ms: number
}

const Fagsystem = {
    AAP: 'AAP',
    Tiltakspenger: 'TILTAKSPENGER',
    Tilleggsstønader: 'TILLEGGSSTØNADER',
    Dagpenger: 'DAGPENGER',
}

const Topics = {
    avstemming: 'helved.avstemming.v1',
    oppdrag: 'helved.oppdrag.v1',
    oppdragsdata: 'helved.oppdragsdata.v1',
    dryRunAAP: 'helved.dryrun-aap.v1',
    dryRunTilleggsstønader: 'helved.dryrun-ts.v1',
    dryRunTiltakspenger: 'helved.dryrun-tp.v1',
    dryRunDagpenger: 'helved.dryrun-dp.v1',
    kvittering: 'helved.kvittering.v1',
    utbetalinger: 'helved.utbetalinger.v1',
    utbetalingerAAP: 'helved.utbetalinger-aap.v1',
    saker: 'helved.saker.v1',
    status: 'helved.status.v1',
    simuleringer: 'helved.simuleringer.v1',
} as const

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
    avstemming() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ns2:avstemmingsdata xmlns:ns2="http://nav.no/virksomhet/tjenester/avstemming/meldinger/v1">
    <aksjon>
        <aksjonType>AVSL</aksjonType>
        <kildeType>AVLEV</kildeType>
        <avstemmingType>GRSN</avstemmingType>
        <avleverendeKomponentKode>TILTPENG</avleverendeKomponentKode>
        <mottakendeKomponentKode>OS</mottakendeKomponentKode>
        <underkomponentKode>TILTPENG</underkomponentKode>
        <nokkelFom>2025-04-09-00</nokkelFom>
        <nokkelTom>2025-04-09-00</nokkelTom>
        <avleverendeAvstemmingId>vh1jac8-TSaZ2cZZuwmRsQ</avleverendeAvstemmingId>
        <brukerId>TILTPENG</brukerId>
    </aksjon>
</ns2:avstemmingsdata>`
    },
    oppdrag() {
        return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<ns2:oppdrag xmlns:ns2="http://www.trygdeetaten.no/skjema/oppdrag">
    <mmel>
        <systemId>231-OPPD</systemId>
        <alvorlighetsgrad>00</alvorlighetsgrad>
    </mmel>
    <oppdrag-110>
        <kodeAksjon>1</kodeAksjon>
        <kodeEndring>ENDR</kodeEndring>
        <kodeFagomraade>TILTPENG</kodeFagomraade>
        <fagsystemId>202503271001</fagsystemId>
        <utbetFrekvens>MND</utbetFrekvens>
        <oppdragGjelderId>14439535912</oppdragGjelderId>
        <datoOppdragGjelderFom>2000-01-01+01:00</datoOppdragGjelderFom>
        <saksbehId>Z990123</saksbehId>
        <avstemming-115>
            <kodeKomponent>TILTPENG</kodeKomponent>
            <nokkelAvstemming>2025-04-10-11.00.00.000000</nokkelAvstemming>
            <tidspktMelding>2025-04-10-11.00.00.000000</tidspktMelding>
        </avstemming-115>
        <oppdrags-enhet-120>
            <typeEnhet>BOS</typeEnhet>
            <enhet>0321</enhet>
            <datoEnhetFom>1970-01-01+01:00</datoEnhetFom>
        </oppdrags-enhet-120>
        <oppdrags-enhet-120>
            <typeEnhet>BEH</typeEnhet>
            <enhet>8020</enhet>
            <datoEnhetFom>1970-01-01+01:00</datoEnhetFom>
        </oppdrags-enhet-120>
        <oppdrags-linje-150>
            <kodeEndringLinje>NY</kodeEndringLinje>
            <vedtakId>2025-04-10</vedtakId>
            <delytelseId>202503271001#16</delytelseId>
            <kodeKlassifik>TPTPAFT</kodeKlassifik>
            <datoVedtakFom>2025-01-27+01:00</datoVedtakFom>
            <datoVedtakTom>2025-01-29+01:00</datoVedtakTom>
            <sats>298</sats>
            <fradragTillegg>T</fradragTillegg>
            <typeSats>DAG7</typeSats>
            <brukKjoreplan>N</brukKjoreplan>
            <saksbehId>Z990123</saksbehId>
            <utbetalesTilId>14439535912</utbetalesTilId>
            <henvisning>22SK08N2GB3GQ7E</henvisning>
            <refFagsystemId>202503271001</refFagsystemId>
            <refDelytelseId>202503271001#12</refDelytelseId>
            <attestant-180>
                <attestantId>Z994127</attestantId>
            </attestant-180>
        </oppdrags-linje-150>
        <oppdrags-linje-150>
            <kodeEndringLinje>NY</kodeEndringLinje>
            <vedtakId>2025-04-10</vedtakId>
            <delytelseId>202503271001#17</delytelseId>
            <kodeKlassifik>TPTPAFT</kodeKlassifik>
            <datoVedtakFom>2025-01-30+01:00</datoVedtakFom>
            <datoVedtakTom>2025-01-30+01:00</datoVedtakTom>
            <sats>224</sats>
            <fradragTillegg>T</fradragTillegg>
            <typeSats>DAG7</typeSats>
            <brukKjoreplan>N</brukKjoreplan>
            <saksbehId>Z990123</saksbehId>
            <utbetalesTilId>14439535912</utbetalesTilId>
            <henvisning>22SK08N2GB3GQ7E</henvisning>
            <refFagsystemId>202503271001</refFagsystemId>
            <refDelytelseId>202503271001#16</refDelytelseId>
            <attestant-180>
                <attestantId>Z994127</attestantId>
            </attestant-180>
        </oppdrags-linje-150>
        <oppdrags-linje-150>
            <kodeEndringLinje>NY</kodeEndringLinje>
            <vedtakId>2025-04-10</vedtakId>
            <delytelseId>202503271001#18</delytelseId>
            <kodeKlassifik>TPBTAF</kodeKlassifik>
            <datoVedtakFom>2025-01-27+01:00</datoVedtakFom>
            <datoVedtakTom>2025-01-29+01:00</datoVedtakTom>
            <sats>110</sats>
            <fradragTillegg>T</fradragTillegg>
            <typeSats>DAG7</typeSats>
            <brukKjoreplan>N</brukKjoreplan>
            <saksbehId>Z990123</saksbehId>
            <utbetalesTilId>14439535912</utbetalesTilId>
            <henvisning>22SK08N2GB3GQ7E</henvisning>
            <refFagsystemId>202503271001</refFagsystemId>
            <refDelytelseId>202503271001#15</refDelytelseId>
            <attestant-180>
                <attestantId>Z994127</attestantId>
            </attestant-180>
        </oppdrags-linje-150>
        <oppdrags-linje-150>
            <kodeEndringLinje>NY</kodeEndringLinje>
            <vedtakId>2025-04-10</vedtakId>
            <delytelseId>202503271001#19</delytelseId>
            <kodeKlassifik>TPBTAF</kodeKlassifik>
            <datoVedtakFom>2025-01-30+01:00</datoVedtakFom>
            <datoVedtakTom>2025-01-30+01:00</datoVedtakTom>
            <sats>82</sats>
            <fradragTillegg>T</fradragTillegg>
            <typeSats>DAG7</typeSats>
            <brukKjoreplan>N</brukKjoreplan>
            <saksbehId>Z990123</saksbehId>
            <utbetalesTilId>14439535912</utbetalesTilId>
            <henvisning>22SK08N2GB3GQ7E</henvisning>
            <refFagsystemId>202503271001</refFagsystemId>
            <refDelytelseId>202503271001#18</refDelytelseId>
            <attestant-180>
                <attestantId>Z994127</attestantId>
            </attestant-180>
        </oppdrags-linje-150>
    </oppdrag-110>
</ns2:oppdrag>`
    },
    saker() {
        return {
            uids: ['fe60902b-d63d-413a-9aa0-a42a21cda1a9'],
        }
    },
    status() {
        return {
            status: 'OK', // OK, FEILET, MOTTATT, HOS_OPPDRAG
            error: null, // { statusCode: number, msg: string, doc: string }
        }
    },
    oppdragsdata() {
        return {
            fagsystem: 'TILTAKSPENGER',
            personident: '14439535912',
            sakId: '202503271001',
            avstemmingsdag: '2025-04-10',
            totalBeløpAllePerioder: 714,
            kvittering: {
                kode: null,
                alvorlighetsgrad: '00',
                melding: null,
            },
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
    utbetaling() {
        return {
            simulate: false,
            uid: 'fe60902b-d63d-413a-9aa0-a42a21cda1a9',
            action: 'CREATE',
            førsteUtbetalingPåSak: true,
            sakId: 'JNC250317014554',
            behandlingId: '1',
            lastPeriodeId: '7fa994f2-332f-4c14-9117-214fc262223f',
            personident: '10917097025',
            vedtakstidspunkt: '2025-03-17T00:45:54',
            stønad: 'AAP_UNDER_ARBEIDSAVKLARING',
            beslutterId: 'Z888888',
            saksbehandlerId: 'Z999999',
            periodetype: 'UKEDAG',
            perioder: [
                {
                    fom: '2025-01-01',
                    tom: '2025-01-03',
                    beløp: 200,
                    betalendeEnhet: null,
                    fastsattDagsats: 200,
                },
            ],
        }
    },
    message(
        overrides: Partial<Message> = {},
        topic_name: string = 'helved.oppprag.v1',
        options: { fom: Date; tom: Date } = {
            fom: subDays(new Date(), 30),
            tom: new Date(),
        }
    ): Message {
        return {
            version: 'v1',
            topic_name: topic_name,
            key: randomUUID(),
            timestamp_ms: randomDateBetween(options.fom, options.tom).getTime(),
            value: '',
            partition: 1,
            offset: 1,
            stream_time_ms: randomDateBetween(
                options.fom,
                options.tom
            ).getTime(),
            system_time_ms: randomDateBetween(
                options.fom,
                options.tom
            ).getTime(),
            ...overrides,
        }
    },
    messages(
        topics: (typeof Topics)[keyof typeof Topics][] = [],
        options: { size?: number; fom: Date; tom: Date } = {
            size: Math.ceil(Math.random() * 100),
            fom: subDays(new Date(), 30),
            tom: new Date(),
        }
    ): Message[] {
        const topicNames = topics.length === 0 ? Object.values(Topics) : topics
        return topicNames.flatMap((topicName) => {
            const numberOfMessages = options.size
                ? Math.ceil(options.size / topicNames.length)
                : Math.ceil(Math.random() * 50)

            return new Array(numberOfMessages).fill(null).map(() => {
                switch (topicName) {
                    case 'helved.avstemming.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.avstemming()) },
                            topicName,
                            options
                        )
                    case 'helved.oppdragsdata.v1':
                        return this.message(
                            { value: Math.random() > 0.5 ? JSON.stringify(TestData.oppdragsdata()) : null },
                            topicName,
                            options
                        )
                    case 'helved.dryrun-aap.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.oppdrag()) },
                            topicName,
                            options
                        )
                    case 'helved.dryrun-ts.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.oppdrag()) },
                            topicName,
                            options
                        )
                    case 'helved.dryrun-tp.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.oppdrag()) },
                            topicName,
                            options
                        )
                    case 'helved.dryrun-dp.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.oppdrag()) },
                            topicName,
                            options
                        )
                    case 'helved.status.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.status()) },
                            topicName,
                            options
                        )
                    case 'helved.utbetalinger-aap.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.utbetaling()) },
                            topicName,
                            options
                        )
                    case 'helved.kvittering.v1':
                        return this.message(
                            {
                                key: `{"fagsystem":"${randomFagsystem()}","sakId":"${randomSakId()}","behandlingId":"${randomBehandlingId()}","lastPeriodeId":"${randomUUID()}"}`,
                                value: JSON.stringify(TestData.status()),
                            },
                            topicName,
                            options
                        )
                    case 'helved.oppdrag.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.oppdrag()) },
                            topicName,
                            options
                        )
                    case 'helved.utbetalinger.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.utbetaling()) },
                            topicName,
                            options
                        )
                    case 'helved.saker.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.saker()) },
                            topicName,
                            options
                        )
                    case 'helved.simuleringer.v1':
                        return this.message(
                            { value: JSON.stringify(TestData.simulering()) },
                            topicName,
                            options
                        )
                }
            })
        })
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

function generateRandomString(length: number): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return new Array(length)
        .fill(0)
        .map((_) => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join("")
}

function randomFagsystem() {
    const index = Math.floor(Math.random() * 4)
    return Object.values(Fagsystem)[index]
}

function randomSakId() {
    return generateRandomString(15)
}

function randomBehandlingId() {
    return generateRandomString(25)
}
