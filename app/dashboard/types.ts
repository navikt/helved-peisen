export type FeiletSummary = {
    count: number
}

export type PendingMismatchSummary = {
    count: number
    sampleKeys: string[]
}

export type AvstemmingStatus = {
    fagsystem: string
    harKjort: boolean
    datoAvstemtFom: string | null
    datoAvstemtTom: string | null
    sisteAvstemtDato: string | null
}

export type ManglendeKvittering = {
    key: string
    traceId: string
    sakId: string | null
    fagsystem: string | null
    sentAt: number
    ageMs: number
}

export type DobbeltutbetalingKilde = {
    key: string
    partition: number
    offset: number
    timestampMs: number
}

export type DobbeltutbetalingCandidate = {
    behandlingId: string
    klassekode: string
    fom: string
    tom: string
    beløp: number
    kilder: DobbeltutbetalingKilde[]
}

export type DashboardSection<T> = {
    data: T | null
    error: string | null
}

export type DashboardSummary = {
    fom: string
    tom: string
    feilet: DashboardSection<FeiletSummary>
    pendingMismatch: DashboardSection<PendingMismatchSummary>
    avstemming: DashboardSection<AvstemmingStatus[]>
    manglendeKvittering: DashboardSection<ManglendeKvittering[]>
    dobbeltutbetalinger: DashboardSection<DobbeltutbetalingCandidate[]>
}
