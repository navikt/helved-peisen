import React from 'react'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import { Header } from '@/components/header/Header.tsx'

import styles from './layout.module.css'

import './globals.css'
import '@navikt/ds-css'

const sourceSans = Source_Sans_3({
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Peisen',
    description:
        'Oversikt og administrering av automatiske oppgaver for Utsjekk',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={clsx(sourceSans.className, styles.body)}>
                <Header />
                <main className={styles.main}>{children}</main>
            </body>
        </html>
    )
}
