'use client'

import React from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { HStack, InternalHeader, Link, Spacer } from '@navikt/ds-react'
import { InternalHeaderTitle } from '@navikt/ds-react/InternalHeader'
import { UserMenu } from '@/components/header/UserMenu.tsx'

import logo from '@/public/logo.png'

const top = '#FF3434'
const centerTop = '#FF8C00'
const center = '#FFED00'
const centerBottom = '#FF8C00'
const bottom = '#FF3434'
const shadow = '#8135ff'

console.log(
    `%c
                                                        
 ██████   ███████%c╗%c ██████%c╗%c  ██████%c╗%c  ███████%c╗%c ███%c╗%c  ██%c╗ %c
 ██%c╔══%c██%c╗%c ██%c╔════╝%c   ██%c╔═╝%c ██%c╔════╝%c  ██%c╔════╝%c ████%c╗%c ██%c║ %c
 ██████%c╔╝%c ██████%c╗%c    ██%c║   ╚%c██████%c╗%c  ██████%c╗%c  ██%c╔%c██%c╗%c██%c║ %c
 ██%c╔═══╝%c  ██%c╔═══╝%c    ██%c║    ╚════%c██%c╗%c ██%c╔═══╝%c  ██%c║╚%c████%c║ %c
 ██%c║%c      ███████%c╗%c ██████%c╗%c  ██████%c╔╝%c ███████%c╗%c ██%c║ ╚%c███%c║
 ╚═╝      ╚══════╝ ╚═════╝  ╚═════╝  ╚══════╝ ╚═╝  ╚══╝ 
                                                        
 %cGithub: https://github.com/navikt/helved-peisen        
                                                        
`,
    `color: ${top}`,
    `color: ${shadow}`,
    `color: ${top}`,
    `color: ${shadow}`,
    `color: ${top}`,
    `color: ${shadow}`,
    `color: ${top}`,
    `color: ${shadow}`,
    `color: ${top}`,
    `color: ${shadow}`,
    `color: ${top}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${centerTop}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${center}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${centerBottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`,
    `color: ${shadow}`,
    `color: ${bottom}`
)

function TabLink({ children, href }: { children: React.ReactNode; href: string }) {
    const path = usePathname()
    return (
        <Link
            className={clsx(
                'px-4 py-0 no-underline text-ax-text-neutral',
                path.startsWith(href) && 'shadow-tab-shadow'
            )}
            href={href}
        >
            {children}
        </Link>
    )
}

export function Header() {
    return (
        <InternalHeader>
            <InternalHeaderTitle as="h1">
                <span className="flex gap-2">
                    <Image src={logo.src} alt="" width={24} height={24} />
                    <span>Peisen</span>
                </span>
            </InternalHeaderTitle>
            <HStack>
                <TabLink href="/kafka">Kafka</TabLink>
                <TabLink href="/sak">Sak</TabLink>
            </HStack>
            <Spacer />
            <UserMenu />
        </InternalHeader>
    )
}
