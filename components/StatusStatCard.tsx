import { BodyShort, LocalAlert } from '@navikt/ds-react'

export type StatusStatCardStatus = 'ok' | 'warning' | 'error' | 'neutral'

type Props = {
    label: string
    value: string
    status: StatusStatCardStatus
    statusLabel: string
}

const alertStatusFor = (status: StatusStatCardStatus) => {
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
// TODO: Usikker på om LocalAlert er riktig å bruke her? Virker som den brukes for å varsle om noe som har skjedd, mens InfoCard er for å fremheve viktig informasjon, som kanskje er det vi gjør i dashboardet her?
export function StatusStatCard({ label, value, status, statusLabel }: Props) {
    return (
        <LocalAlert status={alertStatusFor(status)} size="small">
            <LocalAlert.Header className="*:shrink-0">
                <LocalAlert.Title as="div" className="whitespace-nowrap">
                    {label}
                </LocalAlert.Title>
            </LocalAlert.Header>
            <LocalAlert.Content>
                <BodyShort className="text-2xl font-bold text-center">{value}</BodyShort>
                <span className="sr-only">Status: {statusLabel}</span>
            </LocalAlert.Content>
        </LocalAlert>
    )
}
