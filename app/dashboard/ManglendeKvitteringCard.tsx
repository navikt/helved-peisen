import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    antallManglendeKvitteringer: number
}

export const ManglendeKvitteringCard: React.FC<Props> = ({ antallManglendeKvitteringer }) => {
    return (
        <StatusStatCard
            label="Mangler kvittering"
            value={`${antallManglendeKvitteringer}`}
            status={antallManglendeKvitteringer === 0 ? 'ok' : 'error'}
            statusLabel={antallManglendeKvitteringer === 0 ? 'OK' : 'Sjekk'}
        />
    )
}
