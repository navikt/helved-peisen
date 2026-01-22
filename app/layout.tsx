import React from 'react'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

import { Header } from '@/components/header/Header.tsx'
import { ThemeProvider } from '@/components/ThemeProvider.tsx'
import { LoggerProvider } from '@/components/LoggerProvider.tsx'
import { UserProvider } from '@/components/UserProvider'
import { getUser } from '@/app/actions.ts'

import './globals.css'

export const metadata: Metadata = {
    title: 'Peisen',
    description: 'Oversikt over meldinger i systemene til Team Hel Ved',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const user = await getUser()
    return (
        <html lang="en">
            <body>
                <UserProvider user={user}>
                    <LoggerProvider>
                        <ThemeProvider>
                            <Header />
                            <Toaster position="bottom-center" />
                            <main className="relative flex flex-col p-4">{children}</main>
                        </ThemeProvider>
                    </LoggerProvider>
                </UserProvider>
            </body>
        </html>
    )
}
