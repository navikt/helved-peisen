import { AuditFiltereProvider } from '@/app/audit/kafka/AuditFiltereContext.tsx'
import { AuditFiltere, AuditSearchProvider } from '@/app/audit/kafka/AuditFiltere.tsx'
import { AuditView } from '@/app/audit/kafka/AuditView.tsx'
import { SortStateProvider } from '@/app/kafka/table/SortState.tsx'
import { AuditMessagesProvider } from '@/app/audit/kafka/AuditMessagesContext.tsx'
import { BodyShort, Link } from '@navikt/ds-react'

import { checkToken } from '@/lib/server/auth.ts'

export default async function AuditOverview() {
    await checkToken()

    return (
        <section className="flex flex-col">
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
