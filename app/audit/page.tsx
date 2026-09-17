import { AuditFiltereProvider } from '@/app/audit/AuditFiltereContext.tsx'
import { AuditFiltere, AuditSearchProvider } from '@/app/audit/AuditFiltere.tsx'
import { AuditView } from '@/app/audit/AuditView.tsx'
import { SortStateProvider } from '@/app/kafka/table/SortState'
import { AuditMessagesProvider } from '@/app/audit/AuditMessagesContext.tsx'

import { checkToken } from '@/lib/server/auth.ts'

export default async function AuditOverview() {
    await checkToken()

    return (
        <section className="flex flex-col p-4">
            <AuditFiltereProvider>
                <AuditSearchProvider>
                    <AuditMessagesProvider>
                        <SortStateProvider>
                            <AuditFiltere className="mb-8" />
                            <AuditView />
                        </SortStateProvider>
                    </AuditMessagesProvider>
                </AuditSearchProvider>
            </AuditFiltereProvider>
        </section>
    )
}
