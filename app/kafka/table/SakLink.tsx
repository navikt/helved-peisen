import type { Message } from '@/app/kafka/types.ts'
import { Link } from '@navikt/ds-react'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { parsedXML } from '@/lib/xml'

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
    if (!message.value) {
        return null
    }
    switch (message.topic_name) {
        case 'helved.avstemming.v1':
        case 'helved.dryrun-aap.v1':
        case 'helved.dryrun-tp.v1':
        case 'helved.dryrun-ts.v1':
        case 'helved.dryrun-dp.v1':
        case 'helved.fk.v1':
        case 'helved.saker.v1':
        case 'helved.utbetalinger-tp.v1':
        case 'helved.status.v1':
            return null
        case 'helved.simuleringer.v1': {
            const xml = parsedXML(message.value)
            const sakId = xml.querySelector('request > oppdrag > fagsystemId')?.textContent
            const fagsystem = xml.querySelector('request > oppdrag > kodeFagomraade')?.textContent

            if (!fagsystem || !sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=${tilFagsystem(fagsystem)}`
        }
        case 'helved.utbetalinger-aap.v1':
        case 'aap.utbetaling.v1': {
            const json = JSON.parse(message.value)
            const sakId = json.sakId

            if (!sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=AAP`
        }

        case 'helved.utbetalinger-dp.v1':
        case 'teamdagpenger.utbetaling.v1': {
            const json = JSON.parse(message.value)
            const sakId = json.sakId

            if (!sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=DP`
        }
        case 'helved.utbetalinger-ts.v1':
        case 'tilleggsstonader.utbetaling.v1': {
            const json = JSON.parse(message.value)
            const sakId = json.sakId

            if (!sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=TILLST`
        }
        case 'helved.utbetalinger-historisk.v1':
        case 'historisk.utbetaling.v1': {
            const json = JSON.parse(message.value)
            const sakId = json.sakId

            if (!sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=HELSREF`
        }
        case 'helved.utbetalinger.v1': {
            const json = JSON.parse(message.value)
            const fagsystem = json.fagsystem
            const sakId = json.sakId

            if (!fagsystem || !sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=${tilFagsystem(fagsystem)}`
        }
        case 'helved.pending-utbetalinger.v1': {
            const json = JSON.parse(message.value)
            const fagsystem = json.fagsystem
            const sakId = json.sakId

            if (!fagsystem || !sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=${tilFagsystem(fagsystem)}`
        }
        case 'helved.kvittering.v1':
        case 'helved.oppdrag.v1': {
            const xml = parsedXML(message.value)
            const sakId = xml.querySelector('oppdrag-110 > fagsystemId')?.textContent
            const fagsystem = xml.querySelector('oppdrag-110 > kodeFagomraade')?.textContent

            if (!fagsystem || !sakId) {
                return null
            }

            return `/sak?sakId=${sakId}&fagsystem=${tilFagsystem(fagsystem)}`
        }
    }
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
