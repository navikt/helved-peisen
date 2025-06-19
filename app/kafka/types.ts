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

export type OppdragMessageValue = {
    mmel?: {
        systemId?: string | null
        kodeMelding?: string | null
        alvorlighetsgrad?: string | null
        beskrMelding?: string | null
        sqlKode?: string | null
        sqlState?: string | null
        sqlMelding?: string | null
        mqCompletionKode?: string | null
        mqReasonKode?: string | null
        programId?: string | null
        sectionNavn?: string | null
    } | null
    'oppdrag-110': {
        kodeAksjon: string
        kodeEndring: string
        kodeStatus?: string | null
        datoStatusFom?: string | null
        kodeFagomraade: string
        fagsystemId?: string | null
        oppdragsId?: number | null
        utbetFrekvens?: string | null
        datoForfall?: string | null
        stonadId?: string | null
        oppdragGjelderId: string
        datoOppdragGjelderFom: string
        saksbehId: string
        'oppdrags-status-111S'?:
            | {
                  kodeStatus: string
                  datoStatusFom: string
                  tidspktReg: string
                  saksbehId: string
              }[]
            | null
        'oppdrag-gjelder-112S'?:
            | {
                  oppdragGjelderId: string
                  datoOppdragGjelderFom: string
                  tidspktReg: string
                  saksbehId: string
              }[]
            | null
        'bilagstype-113'?: {
            bilagsType: string
        }
        'avstemming-115'?: {
            kodeKomponent: string
            nokkelAvstemming: string
            tidspktMelding: string
        } | null
        'ompostering-116'?: {
            omPostering: string
            datoOmposterFom?: string
            feilreg?: string
            tidspktReg: string
            saksbehId: string
        } | null
        'avvent-118'?: {
            datoAvventFom?: string
            datoAvventTom?: string
            kodeArsak?: string
            datoOverfores?: string
            feilreg?: string
        } | null
        'oppdrags-enhet-120S'?:
            | {
                  typeEnhet: string
                  enhet?: string
                  datoEnhetFom: string
              }[]
            | null
        'belops-grense-130S'?:
            | {
                  typeGrense: string
                  belopGrense: number
                  datoGrenseFom: string
                  datoGrenseTom?: string
                  feilreg?: string
              }[]
            | null
        'tekst-140S'?:
            | {
                  tekstLnr: number
                  kodeTekst?: string
                  tekst?: string
                  datoTekstFom: string
                  datoTekstTom?: string
                  feilreg?: string
              }[]
            | null
        'oppdrags-linje-150S'?: {
            kodeEndringLinje: string
            kodeStatusLinje?: string | null
            datoStatusFom?: string | null
            vedtakId?: string | null
            delytelseId?: string | null
            linjeId?: number | null
            kodeKlassifik: string
            datoKlassifikFom?: string | null
            datoVedtakFom: string
            datoVedtakTom?: string | null
            sats: number
            fradragTillegg: string
            typeSats: string
            skyldnerId?: string | null
            datoSkyldnerFom?: string | null
            kravhaverId?: string | null
            datoKravhaverFom?: string | null
            kid?: string | null
            datoKidFom?: string | null
            brukKjoreplan?: string | null
            saksbehId: string
            utbetalesTilId?: string | null
            datoUtbetalesTilIdFom?: string | null
            kodeArbeidsgiver?: string | null
            henvisning?: string | null
            typeSoknad?: string | null
            refFagsystemId?: string | null
            refOppdragsId?: number | null
            refDelytelseId?: string | null
            refLinjeId?: number | null
            'linje-status-151S'?:
                | {
                      kodeStatusLinje: string
                      datoStatusFom: string
                      tidspktReg: string
                      saksbehId: string
                  }[]
                | null
            'klassifikasjon-152S'?:
                | {
                      kodeKlassifik: string
                      datoKlassifikFom: string
                      tidspktReg: string
                      saksbehId: string
                  }[]
                | null
            'skyldner-153S'?:
                | {
                      skyldnerId: string
                      datoSkyldnerFom: string
                      tidspktReg: string
                      saksbehId: string
                  }[]
                | null
            'kid-154S'?:
                | {
                      kid: string
                      datoKidFom: string
                      tidspktReg: string
                      saksbehId: string
                  }[]
                | null
            'utbetale-til-155S'?:
                | {
                      utbetalesTilId: string
                      datoUtbetalesTilIdFom: string
                      tidspktReg: string
                      saksbehId: string
                  }[]
                | null
            'refusjonsinfo-156'?:
                | {
                      maksDato?: string
                      refunderesId?: string
                      datoFom: string
                  }[]
                | null
            'vedtakssats-157'?: {
                vedtakssats: number
            } | null
            'linje-tekst-158S'?:
                | {
                      tekstLnr: number
                      tekstKode?: string
                      tekst?: string
                      datoTekstFom: string
                      datoTekstTom?: string
                      feilreg?: string
                  }[]
                | null
            'linje-enhet-160S'?:
                | {
                      typeEnhet: string
                      enhet?: string
                      datoEnhetFom: string
                  }[]
                | null
            'grad-170S'?:
                | {
                      typeGrad: string
                      grad: number
                  }[]
                | null
            'attestant-180S'?:
                | {
                      attestantId: string
                      datoUgyldigFom?: string
                  }[]
                | null
            'valuta-190S'?: {
                typeValuta: string
                valuta: string
                datoValutaFom: string
                feilreg?: string
            } | null
        }[]
    }
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
