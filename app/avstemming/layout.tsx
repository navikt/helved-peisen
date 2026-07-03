import { PropsWithChildren } from 'react'
import { Sidebar, SidebarLink } from '@/components/Sidebar.tsx'

export default function AvstemmingLayout({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-col gap-16 p-4">
            <div className="flex gap-12">
                <Sidebar>
                    <SidebarLink href="/avstemming">Avstemminger</SidebarLink>
                    <SidebarLink href="/avstemming/dryrun">Dryrun</SidebarLink>
                </Sidebar>
                {children}
            </div>
        </div>
    )
}
