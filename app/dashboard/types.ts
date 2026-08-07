import { Message } from '../kafka/types'

type PendingMismatch = {
    uid: string
    sakId?: string
    fagsystem?: string
}

type Avstemming = {
    fagsystem: string
    sisteAvstemtDato?: string | null
    datoAvstemtFom?: string | null
    datoAvstemtTom?: string | null
}

type DobbeltUtbetaling = {
    behandlingId: string
    klassekode: string
    fom: string
    tom: string
    beløp: number
    kilder: {
        [key: string]: {
            key: string
            partition: number
            offset: number
            timestampMs: number
        }
    }
}

export type DashboardResponse = {
    feiletUtbetalinger: Message[]
    pendingMismatch: PendingMismatch[]
    avstemming: Avstemming[]
    oppdragUtenKvittering: Message[]
    dobbeltutbetalinger: DobbeltUtbetaling[]
}
