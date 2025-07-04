import React from 'react'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import { Header } from '@/components/header/Header.tsx'
import { ThemeProvider } from '@/components/ThemeProvider.tsx'
import { LoggerProvider } from '@/components/LoggerProvider.tsx'
import { Toaster } from 'react-hot-toast'

import styles from './layout.module.css'

import '@navikt/ds-css/darkside'
import './globals.css'

const sourceSans = Source_Sans_3({
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Peisen',
    description: 'Oversikt over meldinger i systemene til Team Hel Ved',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className={clsx(sourceSans.className, styles.body)}>
                <LoggerProvider>
                    <ThemeProvider>
                        <Header />
                        <Toaster position="bottom-center" />
                        <main className={styles.main}>{children}</main>
                    </ThemeProvider>
                </LoggerProvider>
            </body>
        </html>
    )
}
