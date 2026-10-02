import { BodyShort } from '@navikt/ds-react'

import { WorkflowAuditView } from '@/app/audit/workflows/WorkflowAuditView.tsx'
import { checkToken } from '@/lib/server/auth.ts'

export default async function WorkflowAuditPage() {
    await checkToken()

    return (
        <section className="flex flex-col">
            <BodyShort className="mb-8">
                GitHub-workflow-runs, hentet fra Speiderhytta.
            </BodyShort>
            <WorkflowAuditView />
        </section>
    )
}
