import React, { useEffect, useState } from 'react'
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
import { getUser, User } from '@/components/header/getUser.ts'

export const UserMenu: React.FC = () => {
    const [user, setUser] = useState<User | null>()

    useEffect(() => {
        getUser().then(setUser)
    }, [])

    if (!user) {
        return null
    }

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
