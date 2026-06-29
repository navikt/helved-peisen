export type AvstemmingRequest = {
    today: string
    fom: string
    tom: string
}

export type Avstemming = {
    fagsystem: string
    dato: Date
    fom: Date
    tom: Date
    totalAntall: number
    totalBelop: number
    grunnlag: {
        godkjentAntall: number
        godkjentBelop: number
        godkjentFortegn?: string
        varselAntall: number
        varselBelop: number
        varselFortegn?: string
        avvistAntall: number
        avvistBelop: number
        avvistFortegn?: string
        manglerAntall: number
        manglerBelop: number
        manglerFortegn?: string
    }
    detaljs: {
        detaljType: string
        offnr: string
        avleverendeTransaksjonNokkel: string
        meldingKode: string
        alvorlighetsgrad: string
        tekstMelding: string
        tidspunkt: string
    }[]
}

type Aksjon = {
    aksjonType: 'START' | 'DATA' | 'AVSL'
    kildeType: string
    avstemmingType: string
    avleverendeKomponentKode: string
    mottakendeKomponentKode: string
    underkomponentKode: string
    nokkelFom: string
    nokkelTom: string
    tidspunktAvstemmingTom: string | null
    avleverendeAvstemmingId: string
    brukerId: string
}

type StartMelding = {
    aksjon: Aksjon & {
        aksjonType: 'START'
    }
}

export type DataMelding = {
    aksjon: Aksjon & {
        aksjonType: 'DATA'
    }
    total: {
        totalAntall: number
        totalBelop: number
        fortegn: string
    }
    periode: {
        datoAvstemtFom: string
        datoAvstemtTom: string
    }
    grunnlag: {
        godkjentAntall: number
        godkjentBelop: number
        godkjentFortegn?: string
        varselAntall: number
        varselBelop: number
        varselFortegn?: string
        avvistAntall: number
        avvistBelop: number
        avvistFortegn?: string
        manglerAntall: number
        manglerBelop: number
        manglerFortegn?: string
    }
    detaljs?:
        | {
              detaljType: string
              offnr: string
              avleverendeTransaksjonNokkel: string
              meldingKode: string
              alvorlighetsgrad: string
              tekstMelding: string
              tidspunkt: string
          }[]
        | null
}

type AvsluttMelding = {
    aksjon: Aksjon & {
        aksjonType: 'AVSL'
    }
}

type AvstemmingMelding = StartMelding | DataMelding | AvsluttMelding

export type FagsystemAvstemming = {
    first: string // Fagsystem
    second: AvstemmingMelding[]
}

export type AvstemmingResponse = FagsystemAvstemming[]

export const isDataMelding = (melding: AvstemmingMelding): melding is DataMelding => {
    return melding.aksjon.aksjonType === 'DATA'
}
