import { DashboardSummary } from './types'
import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    avstemming: DashboardSummary['avstemming']
}

export const AvstemmingCard: React.FC<Props> = ({ avstemming }) => {
    if (avstemming.error) {
        return <StatusStatCard label="Avstemming i går" value="-" status="neutral" statusLabel="Feil" />
    }
    const antallAvstemminger = avstemming.data?.length ?? 0
    const antallKjørteAvstemminger = avstemming.data?.filter((s) => s.harKjort).length ?? 0
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
