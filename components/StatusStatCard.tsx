import { Heading, LocalAlert } from '@navikt/ds-react'

export type StatusStatCardStatus = 'ok' | 'warning' | 'error' | 'neutral'

type Props = {
    label: string
    value: string
    status: StatusStatCardStatus
    statusLabel: string
}

const alertStatusFor = (status: StatusStatCardStatus): 'success' | 'warning' | 'error' | 'announcement' => {
    switch (status) {
        case 'ok':
            return 'success'
        case 'warning':
            return 'warning'
        case 'error':
            return 'error'
        default:
            return 'announcement'
    }
}

/**
 * Statuskort brukt av /dashboard for å gjøre det raskt å se hva som trenger
 * oppmerksomhet. Bygger på Aksel sin LocalAlert, som fargekoder
 * (grønn/gul/rød/nøytral) og velger status-ikon automatisk.
 * @see https://aksel.nav.no/komponenter/core/localalert?demo=alert-localdemo-success
 */
export default function StatusStatCard({ label, value, status, statusLabel }: Props) {
    return (
        <LocalAlert status={alertStatusFor(status)} className="h-full transition-shadow hover:shadow-md">
            <LocalAlert.Header>
                <LocalAlert.Title as="h3" className="text-sm uppercase tracking-wide">
                    {label}
                </LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                <Heading level="3" size="large" className="text-center">
                    {value}
                </Heading>
                <span className="sr-only">Status: {statusLabel}</span>
            </LocalAlert.Content>
        </LocalAlert>
    )
}
