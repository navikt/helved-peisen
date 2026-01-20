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
    if (!message.sakId || !message.fagsystem) {
        return null
    }

    if (message.topic_name === 'tilleggsstonader.utbetaling.v1') {
        return `/sak?sakId=${message.sakId}&fagsystem=TILLST,TILLSTPB,TILLSTLM,TILLSTBO,TILLSTDR,TILLSTRS,TILLSTRO,TILLSTRA,TILLSTFL`
    }

    return `/sak?sakId=${message.sakId}&fagsystem=${tilFagsystem(message.fagsystem)}`
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
