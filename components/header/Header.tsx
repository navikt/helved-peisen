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

console.log(
    `%c
                                                        
 ██████   ███████╗ ██████╗  ██████╗  ███████╗ ███╗  ██╗ 
 ██╔══██╗ ██╔════╝   ██╔═╝ ██╔════╝  ██╔════╝ ████╗ ██║ %c
 ██████╔╝ ██████╗    ██║   ╚██████╗  ██████╗  ██╔██╗██║ 
 ██╔═══╝  ██╔═══╝    ██║    ╚════██╗ ██╔═══╝  ██║╚████║ %c
 ██║      ███████╗ ██████╗  ██████╔╝ ███████╗ ██║ ╚███║ 
 ╚═╝      ╚══════╝ ╚═════╝  ╚═════╝  ╚══════╝ ╚═╝  ╚══╝ 
                                                        
 Github: https://github.com/navikt/helved-peisen        
                                                        
`,
    'color: #bc002a',
    'color: #e75e01',
    'color: #ffcb6f'
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
            </HStack>
            <Spacer />
            <UserMenu />
        </InternalHeader>
    )
}
