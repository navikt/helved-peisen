import { DashboardResponse } from './types'
import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    avstemming: DashboardResponse['avstemming']
}

export const AvstemmingCard: React.FC<Props> = ({ avstemming }) => {
    const required = avstemming.filter((row) => row.status !== 'NOT_REQUIRED')
    const completed = required.filter((row) => row.status === 'COMPLETED')

    // TODO: Det her er strengt tatt ikke sant. Det kan være at det ikke var noe som trengte avstemmes for perioden det gjelder, og denne vil kunne gi oss falske positiver
    const avvik = avstemming.filter((it) => it.status === 'MISSING').length > 0

    return (
        <StatusStatCard
            label="Avstemming i går"
            value={`${completed.length}/${required.length}`}
            status={avvik ? 'error' : 'ok'}
            statusLabel={avvik ? 'Sjekk' : 'OK'}
        />
    )
}
