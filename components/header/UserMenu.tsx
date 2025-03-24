'use server'

import React from 'react'
import { InternalHeaderUserButton } from '@navikt/ds-react/InternalHeader'
import { BodyShort, Detail, Dropdown, Link, Spacer } from '@navikt/ds-react'
import {
    DropdownMenu,
    DropdownMenuDivider,
    DropdownMenuList,
    DropdownMenuListItem,
    DropdownToggle,
} from '@navikt/ds-react/Dropdown'
import { LeaveIcon } from '@navikt/aksel-icons'
import { faker } from '@faker-js/faker'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

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
export const UserMenu: React.FC = async () => {
    const user = await getUser()

    return (
        <Dropdown>
            <InternalHeaderUserButton as={DropdownToggle} name={user.name} />
            <DropdownMenu>
                <dl>
                    <BodyShort as="dt" size="small">
                        {user.name}
                    </BodyShort>
                    <Detail as="dd">{user.ident}</Detail>
                </dl>
                <DropdownMenuDivider />
                <DropdownMenuList>
                    <DropdownMenuListItem as={Link} href="/oauth2/logout">
                        Logg ut <Spacer />{' '}
                        <LeaveIcon aria-hidden fontSize="1.5rem" />
                    </DropdownMenuListItem>
                </DropdownMenuList>
            </DropdownMenu>
        </Dropdown>
    )
}
