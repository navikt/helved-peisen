export const Topics = {
    avstemming: 'helved.avstemming.v1',
    oppdrag: 'helved.oppdrag.v1',
    oppdragsData: 'helved.oppdragsdata.v1',
    dryrunAap: 'helved.dryrun-aap.v1',
    dryrunTp: 'helved.dryrun-tp.v1',
    dryrunTs: 'helved.dryrun-ts.v1',
    dryrunDp: 'helved.dryrun-dp.v1',
    kvittering: 'helved.kvittering.v1',
    simulering: 'helved.simuleringer.v1',
    utbetalinger: 'helved.utbetalinger.v1',
    saker: 'helved.saker.v1',
    aap: 'helved.utbetalinger-aap.v1',
    status: 'helved.status.v1',
} as const

export type TopicName = (typeof Topics)[keyof typeof Topics]

export type Message = {
    version: string
    topic_name: TopicName
    key: string
    value: string | null
    partition: number
    offset: number
    timestamp_ms: number
    stream_time_ms: number
    system_time_ms: number
}

export type StatusMessageValue = {
    status: 'OK' | 'FEILET' | 'MOTTATT' | 'HOS_OPPDRAG'
    detaljer?: {
        ytelse:
            | 'DAGPENGER'
            | 'TILTAKSPENGER'
            | 'TILLEGGSSTØNADER'
            | 'AAP'
            | 'HISTORISK'
        linjer: {
            behandlingId: string
            fom: string
            tom: string
            vedtakssats?: number
            beløp: number
            klassekode: string
        }[]
    }
    error?: {
        statusCode: number
        msg: string
        doc: string
    }
}
