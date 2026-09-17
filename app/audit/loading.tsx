import { AuditTableSkeleton } from '@/app/audit/table/AuditTable.tsx'
import { AuditFiltere } from '@/app/audit/AuditFiltere.tsx'

export default function Loading() {
    return (
        <section className="flex flex-col p-4">
            <AuditFiltere className="mb-8" />
            <AuditTableSkeleton />
        </section>
    )
}
