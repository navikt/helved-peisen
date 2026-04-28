export type DeploymentOutcome = 'success' | 'failure' | 'cancelled'

export type Deployment = {
    id: number
    app: string
    sha: string
    env: string
    commitTs: string
    deployStartedTs: string
    deployFinishedTs: string
    leadTimeSeconds: number
    outcome: DeploymentOutcome
    runId: number
    runUrl: string | null
}

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
