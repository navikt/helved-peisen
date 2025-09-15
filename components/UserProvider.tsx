'use client'

import React, { ReactNode, useEffect } from 'react'
import { getUser } from '@/components/header/getUser.ts'

type UserContextValue = null | {
    name: string
    email: string
    ident: string
}

const UserContext = React.createContext<UserContextValue>(null)

type Props = {
    children: ReactNode
}

export const UserProvider: React.FC<Props> = ({ children }) => {
    const [user, setUser] = React.useState<UserContextValue>(null)

    useEffect(() => {
        getUser().then(setUser)
    }, [])

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export const useUser = () => {
    return React.useContext(UserContext)
}
