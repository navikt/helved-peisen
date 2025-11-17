import type { Message } from '@/app/kafka/types.ts'

type Variant =
    | 'warning'
    | 'warning-filled'
    | 'warning-moderate'
    | 'error'
    | 'error-filled'
    | 'error-moderate'
    | 'info'
    | 'info-filled'
    | 'info-moderate'
    | 'success'
    | 'success-filled'
    | 'success-moderate'
    | 'neutral'
    | 'neutral-filled'
    | 'neutral-moderate'
    | 'alt1'
    | 'alt1-filled'
    | 'alt1-moderate'
    | 'alt2'
    | 'alt2-filled'
    | 'alt2-moderate'
    | 'alt3'
    | 'alt3-filled'
    | 'alt3-moderate'

export const variant = (message: Message): Variant => {
    switch (message.topic_name) {
        case 'helved.avstemming.v1':
        case 'helved.kvittering.v1':
        case 'helved.saker.v1':
            return 'info'
        case 'helved.dryrun-ts.v1':
        case 'helved.dryrun-dp.v1':
        case 'helved.dryrun-tp.v1':
        case 'helved.dryrun-aap.v1':
        case 'helved.fk.v1':
        case 'helved.simuleringer.v1':
            return 'neutral'
        case 'aap.utbetaling.v1':
        case 'helved.utbetalinger-aap.v1':
        case 'historisk.utbetaling.v1':
        case 'helved.utbetalinger-historisk.v1':
        case 'helved.utbetalinger-dp.v1':
        case 'helved.utbetalinger-ts.v1':
        case 'helved.utbetalinger-tp.v1':
        case 'helved.utbetalinger.v1':
        case 'helved.pending-utbetalinger.v1':
        case 'helved.oppdrag.v1':
            return 'warning'
        case 'teamdagpenger.utbetaling.v1':
            return 'alt1'
        case 'tilleggsstonader.utbetaling.v1':
        case 'helved.status.v1':
            return 'alt2'
    }
}

export const keepLatest = (messages: Message[]) => {
    const grouped = new Map<string, Message>()
    messages.forEach((message) => {
        const key = `${message.topic_name}:${message.key}`
        const existing = grouped.get(key)
        if (!existing || message.timestamp_ms > existing.timestamp_ms) {
            grouped.set(key, message)
        }
    })
    return Array.from(grouped.values())
}
