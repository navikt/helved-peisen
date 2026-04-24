export type DoraResponse = {
    app: string
    window: {
        from: string
        to: string
    }
    deployFrequencyPerDay: number | null
    leadTimeMedianSeconds: number | null
    leadTimeP90Seconds: number | null
    changeFailureRate: number | null
    mttrMedianSeconds: number | null
    deploymentCount: number | null
    incidentCount: number | null
}
