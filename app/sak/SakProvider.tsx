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
    isLoading: boolean
    setIsLoading: (isLoading: boolean) => void
}

const SakContext = createContext<SakContextValue>({
    sak: null,
    setSak: () => null,
    isLoading: false,
    setIsLoading: () => null,
})

export const useSak = () => {
    return useContext(SakContext)
}

type Props = {
    children: React.ReactNode
}

export const SakProvider: React.FC<Props> = ({ children }) => {
    const [sak, setSak] = useState<SakContextValue['sak'] | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    return (
        <SakContext.Provider
            value={{
                sak: sak,
                setSak: setSak,
                isLoading: isLoading,
                setIsLoading: setIsLoading,
            }}
        >
            {children}
        </SakContext.Provider>
    )
}
