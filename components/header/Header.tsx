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
                                                        
 ██████   ███████╗ ██████╗  ██████╗  ███████╗ ███╗  ██╗ %c
 ██╔══██╗ ██╔════╝   ██╔═╝ ██╔════╝  ██╔════╝ ████╗ ██║ %c
 ██████╔╝ ██████╗    ██║   ╚██████╗  ██████╗  ██╔██╗██║ %c
 ██╔═══╝  ██╔═══╝    ██║    ╚════██╗ ██╔═══╝  ██║╚████║ %c
 ██║      ███████╗ ██████╗  ██████╔╝ ███████╗ ██║ ╚███║ %c
 ╚═╝      ╚══════╝ ╚═════╝  ╚═════╝  ╚══════╝ ╚═╝  ╚══╝ 
                                                        
 %cG%ci%ct%ch%cu%cb: https://github.com/navikt/helved-peisen        
                                                        
`,
    'color: #E40303',
    'color: #FF8C00',
    'color: #FFED00',
    'color: #008026',
    'color: #004CFF',
    'color: #732982',
    'color: #E40303',
    'color: #FF8C00',
    'color: #FFED00',
    'color: #008026',
    'color: #004CFF',
    'color: #732982',
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
