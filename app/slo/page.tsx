import { Alert, Heading, VStack } from '@navikt/ds-react'
import { isSuccessResponse } from '@/lib/api/types.ts'
import {
    fetchDoraAll,
    fetchDoraApp,
    fetchDoraDeployments,
    fetchDoraIncidents,
    isSpeiderhyttaAvailable,
} from '@/app/slo/actions.ts'
import { checkToken } from '@/lib/server/auth.ts'
import type { DoraResponse } from '@/app/slo/types.ts'
import DoraSummary, { DoraTotals } from '@/app/slo/dora-summary.tsx'
import DoraTable from '@/app/slo/dora-table.tsx'

function calculateTotals(rows: DoraResponse[]): DoraTotals {
    const leadTimes = rows.map((row) => row.leadTimeMedianSeconds).filter((value): value is number => value !== null)
    const sortedLeadTimes = [...leadTimes].sort((a, b) => a - b)
    const middle = Math.floor(sortedLeadTimes.length / 2)
    const avgLead =
        sortedLeadTimes.length === 0
            ? null
            : sortedLeadTimes.length % 2 === 0
                ? (sortedLeadTimes[middle - 1] + sortedLeadTimes[middle]) / 2
                : sortedLeadTimes[middle]

    return {
        activeApps: rows.filter((row) => (row.deploymentCount ?? 0) > 0).length,
        totalDeploys: rows.reduce((sum, row) => sum + (row.deploymentCount ?? 0), 0),
        totalIncidents: rows.reduce((sum, row) => sum + (row.incidentCount ?? 0), 0),
        avgLead,
    }
}

export default async function SLOPage() {
    await checkToken()

    if (!(await isSpeiderhyttaAvailable())) {
        return (
            <VStack gap="space-12" className="p-4">
                <Alert variant="info">
                    DORA leveres av speiderhytta, som kun finnes i prod.
                </Alert>
            </VStack>
        )
    }

    const doraRes = await fetchDoraAll()

    if (!isSuccessResponse(doraRes)) {
        return <Alert variant="error">{doraRes.error}</Alert>
    }

    const windowFrom = doraRes.data[0]?.window.from
    const windowTo = doraRes.data[0]?.window.to

    const apps = doraRes.data.map((res) => res.app)
    const totals = calculateTotals(doraRes.data)
    const detailedResults = await Promise.all(
        apps.map(async (app) => {
            const [appRes, deploymentsRes, incidentsRes] = await Promise.all([
                fetchDoraApp(app),
                fetchDoraDeployments(app),
                fetchDoraIncidents(app),
            ])
            return { app, appRes, deploymentsRes, incidentsRes }
        })
    )

    return (
        <VStack gap="space-12" className="p-4">
            <DoraSummary windowFrom={windowFrom} windowTo={windowTo} appCount={apps.length} totals={totals} />
            <DoraTable rows={doraRes.data} />
            {detailedResults.map(({ app, appRes, deploymentsRes, incidentsRes }) => (
                <VStack key={app} gap="space-8">
                    <Heading level="2" size="medium">
                        {app}
                    </Heading>
                    <Heading level="3" size="small">
                        /dora/{app}
                    </Heading>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                        {isSuccessResponse(appRes) ? JSON.stringify(appRes.data, null, 2) : appRes.error}
                    </pre>
                    <Heading level="3" size="small">
                        /dora/{app}/deployments
                    </Heading>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                        {isSuccessResponse(deploymentsRes)
                            ? JSON.stringify(deploymentsRes.data, null, 2)
                            : deploymentsRes.error}
                    </pre>
                    <Heading level="3" size="small">
                        /dora/{app}/incidents
                    </Heading>
                    <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                        {isSuccessResponse(incidentsRes)
                            ? JSON.stringify(incidentsRes.data, null, 2)
                            : incidentsRes.error}
                    </pre>
                </VStack>
            ))}
        </VStack>
    )
}
