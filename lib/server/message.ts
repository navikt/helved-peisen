import type { Message, RawMessage, UtbetalingMessageValue } from '@/app/kafka/types.ts'
import { createHash } from 'crypto'
import { parsedXML } from '@/lib/server/xml'

export function toMessage(raw: RawMessage & Partial<Pick<Message, 'pendingMismatch'>>): Message {
    const badge = badgeForMessage(raw)
    const { value: _sensitiveValue, ...message } = raw
    return { ...message, badge }
}

export function toMessages(rawMessages: RawMessage[]): Message[] {
    return annotatePendingMismatch(rawMessages).map(toMessage).map(sanitizeKey)
}

type UtbetalingPeriode = {
    fom: string
    tom: string
    beløp: number
    vedtakssats: number | null
    betalendeEnhet: string | null
}

type AnnotatedRawMessage = RawMessage & Pick<Message, 'pendingMismatch'>

type UtbetalingInfo = {
    uid: string
    perioder: UtbetalingPeriode[]
}

const utbetalingInfo = (message: RawMessage): UtbetalingInfo | null => {
    if (!message.value) {
        return null
    }

    switch (message.topic_name) {
        case 'helved.utbetalinger.v1':
        case 'helved.pending-utbetalinger.v1': {
            try {
                const { uid, perioder = [] } = JSON.parse(message.value) as UtbetalingMessageValue
                if (!uid) {
                    return null
                }
                return {
                    uid,
                    perioder: perioder
                        .map((periode) => ({
                            fom: periode.fom,
                            tom: periode.tom,
                            beløp: periode.beløp,
                            vedtakssats: periode.vedtakssats ?? null,
                            betalendeEnhet: periode.betalendeEnhet ?? null,
                        }))
                        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
                }
            } catch (_) {
                return null
            }
        }
        default:
            return null
    }
}

const equalPerioder = (a: UtbetalingPeriode[], b: UtbetalingPeriode[]) =>
    a.length === b.length &&
    a.every(
        (periode, index) =>
            periode.fom === b[index].fom &&
            periode.tom === b[index].tom &&
            periode.beløp === b[index].beløp &&
            periode.vedtakssats === b[index].vedtakssats &&
            periode.betalendeEnhet === b[index].betalendeEnhet
    )

export const annotatePendingMismatch = (messages: RawMessage[]): AnnotatedRawMessage[] => {
    type Utbetaling = { message: RawMessage; uid: string; perioder: UtbetalingPeriode[] }

    const utbetalinger: Utbetaling[] = []
    const pendingByUid = new Map<string, Utbetaling[]>()

    for (const message of messages) {
        const info = utbetalingInfo(message)
        if (!info) continue
        const utbetaling: Utbetaling = { message, uid: info.uid, perioder: info.perioder }
        if (message.topic_name === 'helved.utbetalinger.v1') {
            utbetalinger.push(utbetaling)
        } else if (message.topic_name === 'helved.pending-utbetalinger.v1') {
            pendingByUid.set(info.uid, [...(pendingByUid.get(info.uid) ?? []), utbetaling])
        }
    }

    const mismatchedMessages = new Set<RawMessage>()

    for (const utbetaling of utbetalinger) {
        // Find the latest pending that arrived before this utbetaling
        const precedingPending = (pendingByUid.get(utbetaling.uid) ?? [])
            .filter((p) => p.message.system_time_ms < utbetaling.message.system_time_ms)
            .sort((a, b) => b.message.system_time_ms - a.message.system_time_ms)[0]

        if (precedingPending && !equalPerioder(utbetaling.perioder, precedingPending.perioder)) {
            mismatchedMessages.add(utbetaling.message)
            mismatchedMessages.add(precedingPending.message)
        }
    }

    return messages.map((message) =>
        mismatchedMessages.has(message) ? { ...message, pendingMismatch: true } : message
    )
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
            try {
                const value = JSON.parse(message.value)
                return value.dryrun ? 'DRYRUN' : null
            } catch (_) {
                return null
            }
        }
        case 'helved.status.v1': {
            const value = JSON.parse(message.value)
            if (value.simulering) return 'DRYRUN'

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
