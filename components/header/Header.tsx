'use client'

import React from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { InternalHeader, Spacer, Tabs } from '@navikt/ds-react'
import { InternalHeaderTitle } from '@navikt/ds-react/InternalHeader'

import styles from './Header.module.css'

import logo from '@/public/logo.png'
import { TabsList, TabsTab } from '@navikt/ds-react/Tabs'
import { UserMenu } from '@/components/header/UserMenu.tsx'

export function Header() {
    const pathname = usePathname()
    const router = useRouter()

    const onChangeTab = (value: string) => {
        switch (value) {
            case "scheduler": {
                router.push(`/scheduler`)
                break
            }
            case "kafka": {
                router.push(`/kafka`)
                break
            }
        }
    }

    const currentTab = pathname.includes("kafka")
        ? "kafka" : "scheduler"

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
        </InternalHeader>
    )
}
