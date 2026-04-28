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

type PathParams = {
    application: string
}

export default async function SLOapplicationPage({ params }: { params: Promise<PathParams> }) {
    await checkToken()
    const { application } = await params

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
            <Heading level="1" size="large">
                {application}
            </Heading>

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
                    /dora/{application}/deployments
                </Heading>
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {isSuccessResponse(deploymentsRes)
                        ? JSON.stringify(deploymentsRes.data, null, 2)
                        : deploymentsRes.error}
                </pre>
            </VStack>

            <VStack gap="space-8">
                <Heading level="2" size="small">
                    /dora/{application}/incidents
                </Heading>
                <pre className="overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {isSuccessResponse(incidentsRes)
                        ? JSON.stringify(incidentsRes.data, null, 2)
                        : incidentsRes.error}
                </pre>
            </VStack>
        </VStack>
    )
}
