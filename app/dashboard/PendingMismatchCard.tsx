import { Topics } from '@/app/kafka/types.ts'
import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    antallMismatch: number
    fom: string
    tom: string
}

export const PendingMismatchCard: React.FC<Props> = ({ antallMismatch, fom, tom }) => {
    return (
        <a
            href={`/kafka?topics=${Topics.utbetalinger},${Topics.pendingUtbetalinger}&pendingMismatch=true&fom=${fom}&tom=${tom}`}
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
