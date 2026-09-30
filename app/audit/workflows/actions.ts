'use server'

import { logger } from '@navikt/next-logger'
import { unauthorized } from 'next/navigation'

import type { ApiResponse } from '@/lib/api/types.ts'
import { Routes } from '@/lib/api/routes.ts'
import { getSpeiderhyttaApiToken } from '@/lib/server/auth.ts'
import type { AuditEvidence, WorkflowRunSummary } from '@/app/audit/workflows/types.ts'

type WorkflowRunsQuery = {
    from: string
    to: string
    app?: string
}

const OWNER = 'navikt'
const REPO = 'helved-utbetaling'
const LIMIT = 100

function isValidInstant(value: string | undefined): boolean {
    return value === undefined || !Number.isNaN(Date.parse(value))
}

async function speiderhyttaFetch<T>(url: string): Promise<ApiResponse<T>> {
    if (!process.env.SPEIDERHYTTA_BASE_URL) {
        return { data: null, error: 'Speiderhytta er ikke tilgjengelig i dette miljøet.' }
    }

    const token = await getSpeiderhyttaApiToken()
    if (!token) return unauthorized()

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        })

        if (!response.ok) {
            logger.error(`Speiderhytta svarte ${response.status}`)
            return { data: null, error: `Speiderhytta svarte ${response.status}.` }
        }

        return { data: (await response.json()) as T, error: null }
    } catch (error) {
        logger.error(`Kall mot Speiderhytta feilet: ${error instanceof Error ? error.message : String(error)}`)
        return { data: null, error: 'Kall mot Speiderhytta feilet.' }
    }
}

export async function fetchWorkflowEvidence(runId: number): Promise<ApiResponse<AuditEvidence>> {
    if (!Number.isSafeInteger(runId) || runId <= 0) {
        return { data: null, error: 'Ugyldig run-id.' }
    }
    return speiderhyttaFetch(Routes.auditWorkflowEvidence(OWNER, REPO, runId))
}

export async function listWorkflowRuns(query: WorkflowRunsQuery): Promise<ApiResponse<WorkflowRunSummary[]>> {
    if (!isValidInstant(query.from) || !isValidInstant(query.to)) {
        return { data: null, error: 'Ugyldig tidsrom.' }
    }

    const params = new URLSearchParams({
        from: query.from,
        to: query.to,
        limit: String(LIMIT),
    })
    const app = query.app?.trim()
    if ((app?.length ?? 0) > 100) return { data: null, error: 'Ugyldig app-filter.' }
    if (app) params.set('app', app)

    return speiderhyttaFetch(`${Routes.auditWorkflowRuns(OWNER, REPO)}?${params}`)
}
