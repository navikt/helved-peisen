export type AuditWorkflowExecution = {
    id: number | null
    repository: string
    app: string
    workflowFile: string
    workflowPath: string | null
    runId: number
    runAttempt: number
    headSha: string
    event: string
    status: string
    conclusion: string | null
    actorLogin: string | null
    triggeringActorLogin: string | null
    createdAt: string
    runStartedAt: string | null
    updatedAt: string
    runUrl: string
    rawMetadata: unknown
    capturedAt: string
}

export type AuditEvidence = {
    attempts: Array<{
        workflow: AuditWorkflowExecution
        source: unknown
        jobs: unknown[]
    }>
    commits: unknown[]
    controls: unknown[]
}

export type WorkflowRunSummary = {
    repository: string
    app: string
    workflowFile: string
    runId: number
    headSha: string
    commitMessage: string | null
    attemptCount: number
    latestAttempt: number
    status: string
    conclusion: string | null
    deployProdConclusion: string | null
    hasPreviousFailures: boolean
    createdAt: string
    updatedAt: string
    runUrl: string
}
