import { Alert } from '@navikt/ds-react'

import { DatabaseAuditLogsTable } from '@/app/audit/database-logs/DatabaseAuditLogsTable.tsx'
import { checkToken } from '@/lib/server/auth.ts'

export default async function DatabaseAuditLogsPage() {
    await checkToken()

    return process.env.NODE_ENV !== 'production' ? (
        <Alert variant="info">Database-logger er ikke tilgjengelig i dette miljøet.</Alert>
    ) : (
        <DatabaseAuditLogsTable />
    )
}
