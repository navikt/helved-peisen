import { v4 } from 'uuid'
import { Table } from '@navikt/ds-react'
import {
    TableBody,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'

import type { Message } from '@/app/kafka/timeline/types'
import { MessageTableRow } from '@/app/kafka/timeline/MessageTableRow.tsx'

import styles from './MessagesTable.module.css'

const oppdrag = JSON.stringify({
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
})

export const messages: Record<string, Message[]> = {
    'helved.oppdrag.v1': [
        {
            key: v4(),
            timestamp: '2025-03-25T23:00:00.000Z',
            data: oppdrag,
        },
        {
            key: v4(),
            timestamp: '2025-03-25T22:00:00.000Z',
            data: oppdrag,
        },
        {
            key: v4(),
            timestamp: '2025-03-25T21:00:00.000Z',
            data: oppdrag,
        },
        {
            key: v4(),
            timestamp: '2025-03-24T23:00:00.000Z',
            data: oppdrag,
        },
        {
            key: v4(),
            timestamp: '2025-03-23T23:00:00.000Z',
            data: oppdrag,
        },
    ],
    'helved.simuleringer.v1': [],
    'helved.dryrun-aap.v1': [],
    'helved.dryrun-ts.v1': [
        {
            key: v4(),
            timestamp: '2025-03-21T23:00:00.000Z',
            data: '',
        },
        {
            key: v4(),
            timestamp: '2025-03-20T23:00:00.000Z',
            data: '',
        },
    ],
    'helved.dryrun-tp.v1': [],
    'helved.kvittering.v1': [],
    'helved.status.v1': [],
    'helved.kvittering-queue.v1': [],
}

export const MessagesTable = () => {
    const sortedMessages = Object.values(messages)
        .flat()
        .sort(
            (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
        )

    return (
        <div className={styles.container}>
            <Table className={styles.table}>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Key</TableHeaderCell>
                        <TableHeaderCell>Timestamp</TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedMessages.map((message, i) => (
                        <MessageTableRow key={i} message={message} />
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
