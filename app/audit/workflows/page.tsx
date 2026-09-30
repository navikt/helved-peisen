import { BodyShort } from '@navikt/ds-react'

import { WorkflowAuditView } from '@/app/audit/workflows/WorkflowAuditView.tsx'
import { checkToken } from '@/lib/server/auth.ts'

export default async function WorkflowAuditPage() {
    await checkToken()

    return (
        <section className="flex flex-col">
            <BodyShort className="mb-8">
                Auditinformasjon for GitHub-workflow-runs, hentet server-side fra Speiderhytta.
            </BodyShort>
            <WorkflowAuditView />
        </section>
    )
}
