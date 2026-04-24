import { Alert, Heading, Table, VStack } from '@navikt/ds-react'
import { isSuccessResponse } from '@/lib/api/types.ts'
import { TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { format } from 'date-fns'
import {
    fetchDoraAll,
    fetchDoraApp,
    fetchDoraDeployments,
    fetchDoraIncidents,
    isSpeiderhyttaAvailable,
} from '@/app/slo/actions.ts'
import { checkToken } from '@/lib/server/auth.ts'

export default async function SLOPage() {
    await checkToken()

    if (!(await isSpeiderhyttaAvailable())) {
        return (
            <VStack gap="space-16" className="p-4">
                <Alert variant="info">
                    DORA leveres av speiderhytta, som kun finnes i prod. Ingen data tilgjengelig i dette miljøet.
                </Alert>
            </VStack>
        )
    }

    const doraRes = await fetchDoraAll()

    if (!isSuccessResponse(doraRes)) {
        return <Alert variant="error">{doraRes.error}</Alert>
    }

    const start = doraRes.data[0]?.window.from
    const end = doraRes.data[0]?.window.to

    const apps = doraRes.data.map((d) => d.app)
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
            <Heading level="2" size="medium">
                /dora
            </Heading>
            <div>Start: {format(start, 'yyyy-MM-dd, HH:mm:ss')}</div>
            <div>Slutt: {format(end, 'yyyy-MM-dd, HH:mm:ss')}</div>
            <Table>
                <TableBody>
                    {doraRes.data.map((dora) => (
                        <TableRow key={dora.app}>
                            <TableDataCell>{dora.app}</TableDataCell>
                            <TableDataCell>{dora.deployFrequencyPerDay ?? '-'}</TableDataCell>
                            <TableDataCell>{dora.leadTimeMedianSeconds ?? '-'}</TableDataCell>
                            <TableDataCell>{dora.leadTimeP90Seconds ?? '-'}</TableDataCell>
                            <TableDataCell>{dora.changeFailureRate ?? '-'}</TableDataCell>
                            <TableDataCell>{dora.mttrMedianSeconds ?? '-'}</TableDataCell>
                            <TableDataCell>{dora.deploymentCount ?? '-'}</TableDataCell>
                            <TableDataCell>{dora.incidentCount ?? '-'}</TableDataCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell>App</TableHeaderCell>
                        <TableHeaderCell>Deploy frequency day</TableHeaderCell>
                        <TableHeaderCell>Lead time median seconds</TableHeaderCell>
                        <TableHeaderCell>Lead time P90 seconds</TableHeaderCell>
                        <TableHeaderCell>Change failure rate</TableHeaderCell>
                        <TableHeaderCell>Mean Time to Repair seconds</TableHeaderCell>
                        <TableHeaderCell>Deploy count</TableHeaderCell>
                        <TableHeaderCell>Incident count</TableHeaderCell>
                    </TableRow>
                </TableHeader>
            </Table>
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
