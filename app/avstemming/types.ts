export interface AvstemmingRequest {
    today: string
    fom: string
    tom: string
}

export interface RawAvstemmingMessage {
    value: string
}

export type Avstemming = {
    fagsystem: string
    dato: Date
    fom: Date;
    tom: Date;
    totalAntall: number
    totalBelop: number
    grunnlag: Grunnlag
}

export interface Aksjon {
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

export interface Total {
    totalAntall: number
    totalBelop: number
    fortegn: string
}

export interface Periode {
    datoAvstemtFom: string
    datoAvstemtTom: string
}

export interface Grunnlag {
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

export interface Detaljs {
    detaljType: string
    offnr: string
    avleverendeTransaksjonNokkel: string
    meldingKode: string
    alvorlighetsgrad: string
    tekstMelding: string
    tidspunkt: string
}

export interface AvstemmingMelding {
    aksjon: Aksjon
    total: Total | null
    periode: Periode | null
    grunnlag: Grunnlag | null
    detaljs: Detaljs[]
}

export interface FagsystemAvstemming {
    first: string
    second: AvstemmingMelding[]
}

export type AvstemmingResponse = FagsystemAvstemming[]
