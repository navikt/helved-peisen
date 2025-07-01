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
        case 'helved.oppdragsdata.v1':
        case 'helved.avstemming.v1':
        case 'helved.kvittering.v1':
            return 'info'
        case 'helved.dryrun-ts.v1':
        case 'helved.dryrun-dp.v1':
        case 'helved.dryrun-tp.v1':
        case 'helved.dryrun-aap.v1':
        case 'helved.simuleringer.v1':
            return 'neutral'
        case 'helved.utbetalinger-aap.v1':
        case 'helved.utbetalinger.v1':
            return 'success'
        case 'helved.saker.v1':
            return 'alt1'
        case 'helved.oppdrag.v1':
            return 'warning'
        case 'helved.status.v1':
            return 'alt2'
    }
}
