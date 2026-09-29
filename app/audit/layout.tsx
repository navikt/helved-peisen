import { PropsWithChildren } from 'react'
import { Sidebar, SidebarLink } from '@/components/Sidebar.tsx'

export default function AuditLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col gap-16 p-4">
            <div className="flex gap-12">
                <Sidebar>
                    <SidebarLink href="/audit">Manuelle endringer</SidebarLink>
                    <SidebarLink href="/audit/logger">Audit-logger</SidebarLink>
                </Sidebar>
                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    )
}
