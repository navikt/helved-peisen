import Link from 'next/link'
import { Alert, Heading, HStack, VStack } from '@navikt/ds-react'
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

    return (
        <VStack gap="space-12" className="p-4">
            <Link href="/slo" className="text-ax-text-link">
                <HStack><ArrowLeftIcon title="a11y-title" fontSize="1.5rem" /> Tilbake til SLO</HStack>
            </Link>

            <VStack gap="space-8">
                <Alert variant="info" size="small" className="mb-8">
                    Grafana krever innlogging,{' '}
                    <Link href={grafanaApmUrl} target="_blank" rel="noreferrer">
                        Åpne i Grafana
                    </Link>
                    og last siden på nytt.
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
                    /dora/{application}
                </Heading>
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {isSuccessResponse(applicationRes) ? JSON.stringify(applicationRes.data, null, 2) : applicationRes.error}
                </pre>
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
