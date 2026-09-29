import { AuditFiltereProvider } from '@/app/audit/AuditFiltereContext.tsx'
import { AuditFiltere, AuditSearchProvider } from '@/app/audit/AuditFiltere.tsx'
import { AuditView } from '@/app/audit/AuditView.tsx'
import { SortStateProvider } from '@/app/kafka/table/SortState'
import { AuditMessagesProvider } from '@/app/audit/AuditMessagesContext.tsx'
import { BodyShort, Link, Tabs } from '@navikt/ds-react'
import { TabsList, TabsPanel, TabsTab } from '@navikt/ds-react/Tabs'
import { AuditLogsTable } from '@/app/audit/logs/AuditLogsTable.tsx'

import { checkToken } from '@/lib/server/auth.ts'

export default async function AuditOverview() {
    await checkToken()

    return (
        <section className="flex flex-col p-4">
            <BodyShort className="mb-8">
                Denne siden viser manuelle endringer gjort i peisen. For
                (database)endringer fra audit-logger se{' '}
                <Link
                    href="https://audit-approval.iap.nav.cloud.nais.io/?team=helved"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Gjennomgang av audit-logg (Gaal)
                </Link>
            </BodyShort>
            <Tabs defaultValue="endringer">
                <TabsList>
                    <TabsTab value="endringer" label="Manuelle endringer" />
                    <TabsTab value="audit-logger" label="Audit-logger" />
                </TabsList>
                <TabsPanel value="endringer" className="pt-6">
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
                </TabsPanel>
                <TabsPanel value="audit-logger" className="pt-6">
                    <AuditLogsTable />
                </TabsPanel>
            </Tabs>
        </section>
    )
}
