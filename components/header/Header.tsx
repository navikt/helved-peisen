'use client'

import React from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import { HStack, InternalHeader, Link, Spacer } from '@navikt/ds-react'
import { InternalHeaderTitle } from '@navikt/ds-react/InternalHeader'
import { UserMenu } from '@/components/header/UserMenu.tsx'

import styles from './Header.module.css'

import logo from '@/public/logo.png'

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
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FFED00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF8C00',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`,
    'color: #FF3434',
    `color: ${shadow}`
)

export function Header() {
    const pathname = usePathname()
    return (
        <InternalHeader className={styles.header}>
            <InternalHeaderTitle as="h1">
                <span className={styles.title}>
                    <Image src={logo.src} alt="" width={24} height={24} />
                    <span>Peisen</span>
                </span>
            </InternalHeaderTitle>
            <HStack>
                <Link
                    className={clsx(
                        styles.tab,
                        pathname.startsWith('/kafka') && styles.active
                    )}
                    href="/kafka"
                >
                    Kafka
                </Link>
                <Link
                    className={clsx(
                        styles.tab,
                        pathname.startsWith('/sak') && styles.active
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
