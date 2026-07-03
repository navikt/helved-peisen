'use client'

import clsx from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SidebarLinkProps = React.HTMLAttributes<HTMLAnchorElement> & {
    href: string
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ children, className, ...rest }) => {
    const pathname = usePathname()

    const isActive = pathname.endsWith(rest.href)

    return (
        <Link
            className={clsx(
                isActive && 'bg-(--ax-bg-neutral-moderateA)',
                'text-(length:--text-base) flex px-4 py-1 rounded-(--ax-radius-8) hover:bg-(--ax-bg-neutral-moderate-hoverA)',
                className
            )}
            {...rest}
        >
            {children}
        </Link>
    )
}

type SidebarProps = React.HTMLAttributes<HTMLElement>

export const Sidebar: React.FC<SidebarProps> = ({ children, className, ...rest }) => {
    return (
        <nav className={clsx('flex flex-col gap-2 w-max', className)} {...rest}>
            {children}
        </nav>
    )
}
