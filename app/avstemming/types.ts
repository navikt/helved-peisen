export type AvstemmingRequest = {
    today: string
    fom: string
    tom: string
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

export type AvstemmingMelding = StartMelding | DataMelding | AvsluttMelding

export type FagsystemAvstemming = {
    first: string // Fagsystem
    second: AvstemmingMelding[]
}

export type AvstemmingResponse = FagsystemAvstemming[]

export const isDataMelding = (melding: AvstemmingMelding): melding is DataMelding => {
    return melding.aksjon.aksjonType === 'DATA'
}

export const getFom = (avstemming: DataMelding): Date => {
    return new Date(avstemming.aksjon.nokkelFom.slice(0, 10))
}

export const getTom = (avstemming: DataMelding): Date => {
    return new Date(avstemming.aksjon.nokkelTom.slice(0, 10))
}
