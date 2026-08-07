import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    antallDobleUtbetalinger: number
}

export const DobbeltUtbetalingCard: React.FC<Props> = ({ antallDobleUtbetalinger }) => {
    return (
        <StatusStatCard
            label="Dobbeltutbetalinger"
            value={`${antallDobleUtbetalinger}`}
            status={antallDobleUtbetalinger === 0 ? 'ok' : 'error'}
            statusLabel={antallDobleUtbetalinger === 0 ? 'OK' : 'Sjekk'}
        />
    )
}
