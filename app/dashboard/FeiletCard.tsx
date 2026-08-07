import { StatusStatCard } from '@/components/StatusStatCard.tsx'

type Props = {
    antallFeilet: number
    fom: string
    tom: string
}

export const FeiletCard: React.FC<Props> = ({ antallFeilet, fom, tom }) => {
    return (
        <a href={`/kafka?status=FEILET&fom=${fom}&tom=${tom}`}>
            <StatusStatCard
                label="Feilet"
                value={`${antallFeilet}`}
                status={antallFeilet > 0 ? 'error' : 'ok'}
                statusLabel={antallFeilet > 0 ? 'Sjekk' : 'OK'}
            />
        </a>
    )
}
