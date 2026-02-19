import { Avstemming, Detaljs } from '@/app/avstemming/types.ts'

const fraFagsystem = (kode: string) => {
    switch (kode) {
        case 'TILTPENG':
            return 'Tiltakspenger'
        case 'TILLST':
        case 'TILLSTPB':
        case 'TILLSTLM':
        case 'TILLSTBO':
        case 'TILLSTDR':
        case 'TILLSTRS':
        case 'TILLSTRO':
        case 'TILLSTRA':
        case 'TILLSTFL':
            return 'Tilleggsstønader'
        case 'DP':
            return 'Dagpenger'
        case 'HELSREF':
            return 'Historisk'
        default:
            return kode
    }
}

export const parseAvstemmingXml = (xml: string): Avstemming | null => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')

    const text = (tag: string): string =>
        doc.getElementsByTagName(tag)[0]?.textContent ?? ''
    const num = (tag: string): number => parseInt(text(tag), 10) || 0

    if (text('aksjonType') !== 'DATA') return null

    const fagsystem = text('avleverendeKomponentKode')
    const nokkelFom = text('nokkelFom')
    const nokkelTom = text('nokkelTom')

    if (!fagsystem || !nokkelFom) return null

    const detaljElements = doc.getElementsByTagName('detalj')
    const detaljs: Detaljs[] = Array.from(detaljElements).map((xml) => ({
        detaljType: xml.querySelector('detaljType')?.textContent ?? '',
        offnr: xml.querySelector('offnr')?.textContent ?? '',
        avleverendeTransaksjonNokkel: xml.querySelector('avleverendeTransaksjonNokkel')?.textContent ?? '',
        meldingKode: xml.querySelector('meldingKode')?.textContent ?? '',
        alvorlighetsgrad: xml.querySelector('alvorlighetsgrad')?.textContent ?? '',
        tekstMelding: xml.querySelector('tekstMelding')?.textContent ?? '',
        tidspunkt: xml.querySelector('tidspunkt')?.textContent ?? '',
    }))

    return {
        fagsystem: fraFagsystem(fagsystem),
        dato: new Date(nokkelFom.substring(0, 10)),
        fom: new Date(nokkelFom.substring(0, 10)),
        tom: new Date(nokkelTom.substring(0, 10)),
        totalAntall: num('totalAntall'),
        totalBelop: num('totalBelop'),
        grunnlag: {
            godkjentAntall: num('godkjentAntall'),
            godkjentBelop: num('godkjentBelop'),
            varselAntall: num('varselAntall'),
            varselBelop: num('varselBelop'),
            avvistAntall: num('avvistAntall'),
            avvistBelop: num('avvistBelop'),
            manglerAntall: num('manglerAntall'),
            manglerBelop: num('manglerBelop'),
        },
        detaljs,
    }
}