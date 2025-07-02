'use client'

import type { Dispatch, SetStateAction } from 'react'
import { createContext, useContext, useState } from 'react'

import type { Message } from '@/app/kafka/types.ts'

type SakContextValue = {
    sak: {
        id: string
        fagsystem: string
        hendelser: Message[]
    } | null
    setSak: Dispatch<SetStateAction<SakContextValue['sak']>>
}

const SakContext = createContext<SakContextValue>({
    sak: null,
    setSak: () => null,
})

export const useSak = () => {
    return useContext(SakContext)
}

type Props = {
    children: React.ReactNode
}

export const SakProvider: React.FC<Props> = ({ children }) => {
    const [sak, setSak] = useState<SakContextValue['sak'] | null>(null)

    return (
        <SakContext.Provider
            value={{
                sak: sak,
                setSak: setSak,
            }}
        >
            {children}
        </SakContext.Provider>
    )
}
