import { Tag, TagProps } from '@navikt/ds-react'
import type { TopicName } from '@/app/kafka/types.ts'

type Props = {
    name: TopicName
}

export const TopicNameTag: React.FC<Props> = ({ name }) => {
    const variant: TagProps['variant'] = (() => {
        switch (name) {
            case 'helved.oppdragsdata.v1':
            case 'helved.avstemming.v1':
            case 'helved.kvittering.v1':
                return 'info'
            case 'helved.dryrun-ts.v1':
            case 'helved.dryrun-dp.v1':
            case 'helved.dryrun-tp.v1':
            case 'helved.dryrun-aap.v1':
            case 'helved.simuleringer.v1':
                return "neutral"
            case 'helved.utbetalinger-aap.v1':
            case 'helved.utbetalinger.v1':
                return 'success'
            case 'helved.saker.v1':
                return "alt1"
            case 'helved.oppdrag.v1':
                return 'warning'
        }
    })()

    return <Tag variant={variant}>{name}</Tag>
}
