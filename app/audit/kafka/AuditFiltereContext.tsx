'use client'

import React, { useEffect, useState } from 'react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { subYears } from 'date-fns'

export type AuditFiltereValue = {
    fom: string
    tom: string
    topics: string | null
    fagsystem: string | null
    page: number
    pageSize: number
    orderBy: 'offset' | 'timestamp' | null
    direction: 'ASC' | 'DESC' | null
}

type AuditFiltereContextValue = AuditFiltereValue & {
    setFiltere: (filtere: Partial<AuditFiltereValue>) => void
}

function defaultAuditFiltereValue(searchParams?: ReadonlyURLSearchParams): AuditFiltereValue {
    return {
        fom: searchParams?.get('fom') ?? subYears(new Date(), 1).toISOString(),
        tom: searchParams?.get('tom') ?? 'now',
        topics: searchParams?.get('topics') ?? null,
        fagsystem: searchParams?.get('fagsystem') ?? null,
        page: 1,
        pageSize: 100,
        orderBy: 'timestamp',
        direction: 'DESC',
    }
}

export const AuditFiltereContext = React.createContext<AuditFiltereContextValue>({
    ...defaultAuditFiltereValue(),
    setFiltere: () => null,
})

export const AuditFiltereProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const [filtere, setFiltere] = useState<AuditFiltereValue>(defaultAuditFiltereValue(searchParams))

    useEffect(
        function setDefaults() {
            const params = new URLSearchParams(window.location.search)
            const keys: (keyof AuditFiltereValue)[] = ['fom', 'tom', 'page', 'pageSize', 'orderBy', 'direction']
            for (const key of keys) {
                if (!params.get(key) && !!filtere[key]) {
                    params.set(key, filtere[key].toString())
                }
            }

            window.history.replaceState({}, '', `?${params.toString()}`)
        },
        [filtere]
    )

    const setFilter = (delta: Partial<AuditFiltereValue>) => {
        const newFilters = { ...filtere, ...delta }
        const params = new URLSearchParams(window.location.search)

        for (const [key, value] of Object.entries(newFilters)) {
            if (!value) {
                params.delete(key)
            } else {
                params.set(key, value.toString())
            }
        }

        setFiltere((prev) => ({ ...prev, ...delta }))
        window.history.replaceState({}, '', `?${params.toString()}`)
    }

    return (
        <AuditFiltereContext.Provider value={{ ...filtere, setFiltere: setFilter }}>
            {children}
        </AuditFiltereContext.Provider>
    )
}

export function useAuditFiltere() {
    return React.useContext(AuditFiltereContext)
}
