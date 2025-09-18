import React from 'react'
import clsx from 'clsx'
import type { Metadata } from 'next'
import { Source_Sans_3 } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

import { Header } from '@/components/header/Header.tsx'
import { ThemeProvider } from '@/components/ThemeProvider.tsx'
import { LoggerProvider } from '@/components/LoggerProvider.tsx'
import { UserProvider } from '@/components/UserProvider'
import { getUser } from '@/components/header/getUser'

import styles from './layout.module.css'

import '@navikt/ds-css/darkside'
import './globals.css'

export const metadata: Metadata = {
    title: 'Peisen',
    description: 'Oversikt over meldinger i systemene til Team Hel Ved',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const user = await getUser()
    return (
        <html lang="en">
            <body className={clsx(styles.body)}>
                <UserProvider user={user}>
                    <LoggerProvider>
                        <ThemeProvider>
                            <Header />
                            <Toaster position="bottom-center" />
                            <main className={styles.main}>{children}</main>
                        </ThemeProvider>
                    </LoggerProvider>
                </UserProvider>
            </body>
        </html>
    )
}
