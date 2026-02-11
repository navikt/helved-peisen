import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { createHash } from 'crypto'
import { parsedXML } from '@/lib/server/xml'

export function toMessage(raw: RawMessage): Message {
    const badge = badgeForMessage(raw)
    delete raw['value']
    return { ...raw, badge }
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
        case 'helved.status.v1': {
            const value = JSON.parse(message.value)
            const linjer = value.detaljer?.linjer ?? []
            // TODO: Gir denne falskt positive OPPH?
            const opphør = linjer.some(
                (linje: any) => linje.beløp === 0 && (linje.vedtakssats > 0 || linje.vedtakssats === null)
            )
            return opphør ? 'OPPH' : null
        }
        default:
            return null
    }
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
