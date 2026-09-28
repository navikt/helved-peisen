import { StatusStatCard } from '@/components/StatusStatCard.tsx'

const utbetalingerTopic = 'helved.utbetalinger.v1'
const pendingUtbetalingerTopic = 'helved.pending-utbetalinger.v1'

type Props = {
    antallMismatch: number
    fom: string
    tom: string
}

export const PendingMismatchCard: React.FC<Props> = ({ antallMismatch, fom, tom }) => {
    return (
        <a
            href={`/kafka?topics=${utbetalingerTopic},${pendingUtbetalingerTopic}&pendingMismatch=true&fom=${fom}&tom=${tom}`}
        >
            <StatusStatCard
                label="Pending mismatch"
                value={`${antallMismatch}`}
                status={antallMismatch === 0 ? 'ok' : 'error'}
                statusLabel={antallMismatch === 0 ? 'OK' : 'Sjekk'}
            />
        </a>
    )
}
