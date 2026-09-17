import type { Message } from '@/app/kafka/types.ts'

const TILLEGGSSTONADER = 'TILLST,TILLSTPB,TILLSTLM,TILLSTBO,TILLSTDR,TILLSTRS,TILLSTRO,TILLSTRA,TILLSTFL'

export const tilFagsystem = (kode: string) => {
    switch (kode) {
        case 'TILTAKSPENGER':
            return 'TILTPENG'
        case 'TILLEGGSSTØNADER':
            return TILLEGGSSTONADER
        case 'DAGPENGER':
            return 'DP'
        case 'HISTORISK':
            return 'HELSREF'
        case 'VALP':
            return 'TILSOPP'
        default:
            if (kode.startsWith('TILLST')) {
                return TILLEGGSSTONADER
            }
            return kode
    }
}

export const sakUrl = (message: Message) => {
    const fagsystem =
        message.fagsystem ??
        (() => {
            switch (message.topic_name) {
                case 'aap.utbetaling.v1':
                case 'helved.dryrun-aap.v1':
                    return 'AAP'
                case 'helved.dryrun-tp.v1':
                case 'helved.utbetalinger-tp.v1':
                    return 'TILTPENG'
                case 'helved.dryrun-ts.v1':
                case 'helved.utbetalinger-ts.v1':
                case 'tilleggsstonader.utbetaling.v1':
                    return 'TILLEGGSSTØNADER'
                case 'helved.dryrun-dp.v1':
                case 'teamdagpenger.utbetaling.v1':
                    return 'DP'
                case 'historisk.utbetaling.v1':
                case 'helved.utbetalinger-historisk.v1':
                    return 'HELSREF'
            }
        })()

    if (!message.sakId || !fagsystem) {
        return null
    }

    return `/sak?sakId=${encodeURIComponent(message.sakId)}&fagsystem=${tilFagsystem(fagsystem)}`
}
