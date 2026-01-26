import type { Message, RawMessage, StatusMessageValue } from '@/app/kafka/types.ts'
import { logger } from '@navikt/next-logger'
import { createHash } from 'crypto'
import { parsedXML } from '@/lib/xml.ts'

export function toMessage(raw: RawMessage): Message {
    const status = statusForMessage(raw)
    const badge = badgeForMessage(raw)
    delete raw['value']
    return { ...raw, status, badge }
}

const badgeForMessage = (message: RawMessage) => {
    if (!message.value) {
        return null
    }

    switch (message.topic_name) {
        case 'helved.avstemming.v1': {
            const xmlDoc = parsedXML(message.value)
            const aksjon = xmlDoc.getElementsByTagName('aksjon')?.[0]
            const aksjonType = aksjon?.getElementsByTagName('aksjonType')?.[0]
            return aksjonType?.textContent?.trim() ?? null
        }
        case 'helved.utbetalinger.v1':
        case 'historisk.utbetaling.v1':
        case 'helved.utbetalinger-historisk.v1':
        case 'helved.pending-utbetalinger.v1':
        case 'helved.utbetalinger-aap.v1':
        case 'helved.utbetalinger-ts.v1':
        case 'helved.utbetalinger-tp.v1':
        case 'helved.utbetalinger-dp.v1':
        case 'teamdagpenger.utbetaling.v1':
        case 'tilleggsstonader.utbetaling.v1':
        case 'aap.utbetaling.v1': {
            const value = JSON.parse(message.value)
            return value.dryrun ? 'DRYRUN' : null
        }
        default:
            return null
    }
}

const statusForMessage = (message: RawMessage) => {
    if (!message.value) {
        return null
    }

    switch (message.topic_name) {
        case 'helved.oppdrag.v1':
        case 'helved.kvittering.v1': {
            try {
                const xmlDoc = parsedXML(message.value)
                const mmel = xmlDoc.getElementsByTagName('mmel')?.[0]
                const alvorlighetsgrad = mmel?.getElementsByTagName('alvorlighetsgrad')?.[0]
                const content = alvorlighetsgrad?.textContent?.trim() ?? null

                if (!content) {
                    return null
                }

                return content === '00' ? 'OK' : 'FEILET'
            } catch (e: any) {
                logger.warn(`Klarte ikke parse XML for status:`, e)
                return null
            }
        }

        case 'helved.status.v1': {
            try {
                const value: StatusMessageValue = JSON.parse(message.value)
                return value.status ?? null
            } catch (e: any) {
                logger.warn(`Klarte ikke utlede status`, e)
                return null
            }
        }
    }

    return null
}

export function sanitizeKey(message: Message): Message {
    if (message.topic_name === 'helved.fk.v1' && message.key) {
        return {
            ...message,
            key: createHash('sha256').update(message.key).digest('hex'),
        }
    }

    return message
}
