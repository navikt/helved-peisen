import { Alert, Heading, VStack } from '@navikt/ds-react'

import { checkToken } from '@/lib/server/auth.ts'
import { isSuccessResponse } from '@/lib/api/types.ts'
import { fetchDoraAll, isSpeiderhyttaAvailable } from '@/app/slo/actions.ts'
import { JsonView } from '@/components/JsonView.tsx'

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

    return (
        <VStack gap="space-12" className="p-4">
            <Heading level="2" size="medium">
                /dora
            </Heading>
            {isSuccessResponse(doraRes) ? (
                <JsonView json={doraRes.data as object} />
            ) : (
                <Alert variant="error">{doraRes.error}</Alert>
            )}
        </VStack>
    )
}
