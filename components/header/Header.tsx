'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { InternalHeader, Spacer, Tabs } from '@navikt/ds-react'
import { InternalHeaderTitle } from '@navikt/ds-react/InternalHeader'
import { TabsList, TabsTab } from '@navikt/ds-react/Tabs'
import { UserMenu } from '@/components/header/UserMenu.tsx'

import styles from './Header.module.css'

import logo from '@/public/logo.png'

const logWelcomeMessage = () => {
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
}

export function Header() {
    const pathname = usePathname()
    const router = useRouter()

    const onChangeTab = (value: string) => {
        switch (value) {
            case 'scheduler': {
                router.push(`/scheduler`)
                break
            }
            case 'kafka': {
                router.push(`/kafka`)
                break
            }
        }
    }

    const currentTab = pathname.includes('kafka') ? 'kafka' : 'scheduler'

    useEffect(() => {
        logWelcomeMessage()
    }, [])

    return (
        <InternalHeader className={styles.header}>
            <InternalHeaderTitle as="h1">
                <span className={styles.title}>
                    <Image src={logo.src} alt="" width={24} height={24} />
                    <span>Peisen</span>
                </span>
            </InternalHeaderTitle>
            <Tabs
                className={styles.tabs}
                value={currentTab}
                onChange={onChangeTab}
            >
                <TabsList>
                    <TabsTab value="scheduler" label="Scheduler" />
                    <TabsTab value="kafka" label="Kafka" />
                </TabsList>
            </Tabs>
            <Spacer />
            <UserMenu />
        </InternalHeader>
    )
}
