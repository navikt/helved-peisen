import { AuditLogsTable } from '@/app/audit/logs/AuditLogsTable.tsx'
import { checkToken } from '@/lib/server/auth.ts'

export default async function AuditLoggerPage() {
    await checkToken()

    return <AuditLogsTable />
}
