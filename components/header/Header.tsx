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

export function Header() {
    const pathname = usePathname()
    return (
        <InternalHeader>
            <InternalHeaderTitle as="h1">
                <span className="flex gap-2">
                    <Image src={logo.src} alt="" width={24} height={24} />
                    <span>Peisen</span>
                </span>
            </InternalHeaderTitle>
            <HStack>
                <Link
                    className={clsx(
                        'component px-4 py-0 no-underline text-text-on-neutral',
                        pathname.startsWith('/kafka') && 'shadow-tab-shadow'
                    )}
                    href="/kafka"
                >
                    Kafka
                </Link>
                <Link
                    className={clsx(
                        'component px-4 py-0 no-underline text-text-on-neutral',
                        pathname.startsWith('/sak') && 'shadow-tab-shadow'
                    )}
                    href="/sak"
                >
                    Sak
                </Link>
            </HStack>
            <Spacer />
            <UserMenu />
        </InternalHeader>
    )
}
