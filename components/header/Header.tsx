'use server'

import React from 'react'
import Image from 'next/image'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { InternalHeader, Spacer } from '@navikt/ds-react'
import { InternalHeaderTitle } from '@navikt/ds-react/InternalHeader'
import { faker } from '@faker-js/faker'

import { UserMenu } from '@/components/header/UserMenu.tsx'

import styles from './Header.module.css'

import logo from '@/public/logo.png'

async function getUser(): Promise<{
    name: string
    email: string
    ident: string
}> {
    if (process.env.NODE_ENV === 'development') {
        return {
            name: `${faker.person.firstName()} ${faker.person.lastName()}`,
            email: 'dev@localhost',
            ident: 'A12345',
        }
    }

    const readonlyHeaders = await headers()
    const authHeader = readonlyHeaders.get('Authorization')
    if (!authHeader) {
        redirect('/oauth2/login')
    }

    const token = authHeader.replace('Bearer ', '')
    const jwtPayload = token.split('.')[1]
    const payload = JSON.parse(Buffer.from(jwtPayload, 'base64').toString())

    const name = payload.name
    const email = payload.preferred_username.toLowerCase()
    const ident = payload.NAVident

    return {
        name,
        email,
        ident,
    }
}

export async function Header() {
    const user = await getUser()

    return (
        <InternalHeader className={styles.header}>
            <InternalHeaderTitle as="h1">
                <span className={styles.title}>
                    <Image src={logo.src} alt="" width={24} height={24} />
                    <span>Peisen</span>
                </span>
            </InternalHeaderTitle>
            <Spacer />
            <UserMenu name={user.name} ident={user.ident} />
        </InternalHeader>
    )
}
