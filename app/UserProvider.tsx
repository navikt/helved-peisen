'use client'

import React, { ReactNode } from 'react'

type UserContextValue = null | {
    name: string
    email: string
    ident: string
    isAdmin: boolean
}

const UserContext = React.createContext<UserContextValue>(null)

type Props = {
    user: UserContextValue
    children: ReactNode
}

export const UserProvider: React.FC<Props> = ({ children, user }) => {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export const useUser = () => {
    return React.useContext(UserContext)
}
