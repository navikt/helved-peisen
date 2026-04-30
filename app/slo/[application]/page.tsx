import Link from 'next/link'
import { Alert, BodyShort, Heading, HStack, VStack } from '@navikt/ds-react'
import { isSuccessResponse } from '@/lib/api/types.ts'
import {
    fetchDoraApplication,
    fetchDoraDeployments,
    fetchDoraIncidents,
    isSpeiderhyttaAvailable,
} from '@/app/slo/actions.ts'
import { checkToken } from '@/lib/server/auth.ts'
import { ArrowLeftIcon } from '@navikt/aksel-icons'
import DeploymentsTable from '@/app/slo/[application]/deployments-table.tsx'
import IncidentsTable from '@/app/slo/[application]/incidents-table.tsx'
import StatCard from '@/app/slo/stat-card.tsx'
import { formatDuration, formatMetric } from '@/app/slo/dora-summary.tsx'

type PathParams = {
    application: string
}

export default async function SLOApplicationPage({ params }: { params: Promise<PathParams> }) {
    await checkToken()
    const { application } = await params

    const grafanaApmUrl = `https://grafana.nav.cloud.nais.io/a/nais-apm-app/services/helved/${application}?namespace=helved&sort=errorRate&dir=desc&environment=prod`

    if (!(await isSpeiderhyttaAvailable())) {
        return (
            <VStack gap="space-12" className="p-4">
                <Alert variant="info">
                    DORA leveres av speiderhytta, som kun finnes i prod.
                </Alert>
            </VStack>
        )
    }

    const [applicationRes, deploymentsRes, incidentsRes] = await Promise.all([
        fetchDoraApplication(application),
        fetchDoraDeployments(application),
        fetchDoraIncidents(application),
    ])

    const dora = isSuccessResponse(applicationRes) ? applicationRes.data : null

    return (
        <VStack gap="space-12" className="p-4">
            <Link href="/slo" className="text-ax-text-link">
                <HStack><ArrowLeftIcon title="a11y-title" fontSize="1.5rem" /> Tilbake til SLO</HStack>
            </Link>

            <VStack gap="space-8">
                <Alert variant="info" size="small" className="mb-4">
                    <BodyShort size="small">
                        Hvis dashboardet ikke laster,{' '}
                        <Link href={grafanaApmUrl} target="_blank" rel="noopener noreferrer">
                            åpne i Grafana
                        </Link>{' '}
                        og last siden på nytt.
                    </BodyShort>
                </Alert>

                <iframe
                    src={`${grafanaApmUrl}&kiosk=true`}
                    title={`NAIS APM – ${application}`}
                    className="h-[800px] w-full rounded border border-ax-border-neutral-subtle"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </VStack>

            <VStack gap="space-8">
                <Heading level="2" size="small">
                    DORA-metrikker
                </Heading>
                {isSuccessResponse(applicationRes) ? (
                    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        <StatCard
                            label="Deploy freq."
                            value={formatMetric(applicationRes.data.deployFrequencyPerDay, (v) => v.toFixed(2), '/day')}
                            hint="last 30 days"
                        />
                        <StatCard
                            label="Lead time (median)"
                            value={formatMetric(applicationRes.data.leadTimeMedianSeconds, formatDuration)}
                            hint="commit → deploy"
                        />
                        <StatCard
                            label="Lead time (P90)"
                            value={formatMetric(applicationRes.data.leadTimeP90Seconds, formatDuration)}
                            hint="commit → deploy"
                        />
                        <StatCard
                            label="Change failure"
                            value={formatMetric(applicationRes.data.changeFailureRate, (v) => (v * 100).toFixed(1), '%')}
                            hint="failed deploys"
                        />
                        <StatCard
                            label="MTTR"
                            value={formatMetric(applicationRes.data.mttrMedianSeconds, formatDuration)}
                            hint="median recovery"
                        />
                        <StatCard
                            label="Deployments"
                            value={formatMetric(applicationRes.data.deploymentCount)}
                            hint="last 30 days"
                        />
                        <StatCard
                            label="Incidents"
                            value={formatMetric(applicationRes.data.incidentCount)}
                            hint="last 30 days"
                        />
                    </section>
                ) : (
                    <Alert variant="error">{applicationRes.error}</Alert>
                )}
            </VStack>

            <VStack gap="space-8">
                <Heading level="2" size="small">
                    Deployments
                </Heading>
                {isSuccessResponse(deploymentsRes) ? (
                    <DeploymentsTable rows={deploymentsRes.data} />
                ) : (
                    <Alert variant="error">{deploymentsRes.error}</Alert>
                )}
            </VStack>

            <VStack gap="space-8">
                <Heading level="2" size="small">
                    Incidents
                </Heading>
                {isSuccessResponse(incidentsRes) ? (
                    <IncidentsTable rows={incidentsRes.data} repo="navikt/helved-utbetaling" />
                ) : (
                    <Alert variant="error">{incidentsRes.error}</Alert>
                )}
            </VStack>
        </VStack>
    )
}
