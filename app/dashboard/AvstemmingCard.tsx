import { DashboardResponse } from './types'
import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    avstemming: DashboardResponse['avstemming']
}

export const AvstemmingCard: React.FC<Props> = ({ avstemming }) => {
    const antallAvstemminger = avstemming?.length ?? 0
    const antallKjørteAvstemminger = avstemming?.filter((s) => s.datoAvstemtFom).length ?? 0

    // TODO: Det her er strengt tatt ikke sant. Det kan være at det ikke var noe som trengte avstemmes for perioden det gjelder, og denne vil kunne gi oss falske positiver
    const avvik = antallKjørteAvstemminger !== antallAvstemminger

    return (
        <StatusStatCard
            label="Avstemming i går"
            value={`${antallKjørteAvstemminger}/${antallAvstemminger}`}
            status={avvik ? 'error' : 'ok'}
            statusLabel={avvik ? 'Sjekk' : 'OK'}
        />
    )
}
