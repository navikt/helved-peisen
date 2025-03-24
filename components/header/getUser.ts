"use server"

import { faker } from "@faker-js/faker"
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export type User = {
    name: string
    email: string
    ident: string
}

export async function getUser(): Promise<User> {
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