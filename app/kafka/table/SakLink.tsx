import type { Message } from '@/app/kafka/types.ts'
import { Link } from '@navikt/ds-react'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

const tilFagsystem = (kode: string) => {
    switch (kode) {
        case 'TILTAKSPENGER':
            return 'TILTPENG'
        case 'TILLEGGSSTØNADER':
            return 'TILLST'
        case 'DAGPENGER':
            return 'DP'
        case 'HISTORISK':
            return 'HELSREF'
        default:
            return kode
    }
}

const sakUrl = (message: Message) => {
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
                    return 'TILLST,TILLSTPB,TILLSTLM,TILLSTBO,TILLSTDR,TILLSTRS,TILLSTRO,TILLSTRA,TILLSTFL'
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

    return `/sak?sakId=${message.sakId}&fagsystem=${tilFagsystem(fagsystem)}`
}

type Props = {
    message: Message
}

export const SakLink: React.FC<Props> = ({ message }) => {
    const url = sakUrl(message)

    if (!url) {
        return null
    }

    return (
        <ActionMenuItem>
            <Link className="no-underline text-inherit w-full" href={url} target="_blank" rel="noopener noreferrer">
                Gå til sak
            </Link>
        </ActionMenuItem>
    )
}
