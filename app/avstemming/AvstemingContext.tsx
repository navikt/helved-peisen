'use client'

import { subDays } from 'date-fns'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { ApiResponse } from '@/lib/api/types.ts'
import { AvstemmingMelding } from './types'
import { xmlToJson } from '@/lib/browser/xml'

type AvstemmingFiltereValue = {
    fom: string
    tom: string
}

type AvstemmingContextValue = AvstemmingFiltereValue & {
    loading: boolean
    avstemminger: ApiResponse<{ xml: string; avstemming: AvstemmingMelding }[]> | null
    setFiltere: (filtere: Partial<AvstemmingFiltereValue>) => void
}

const defaultFiltereValue = (searchParams?: ReadonlyURLSearchParams): AvstemmingFiltereValue => ({
    fom: searchParams?.get('fom') ?? subDays(new Date(), 14).toISOString(),
    tom: searchParams?.get('tom') ?? 'now',
})

const dateComponent = (value: string): string => {
    const date = value === 'now' ? new Date().toISOString() : value
    return encodeURIComponent(date)
}

export const AvstemmingContext = createContext<AvstemmingContextValue>({
    ...defaultFiltereValue(),
    loading: false,
    avstemminger: null,
    setFiltere: () => null,
})

export const AvstemmingProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const [filtere, setFiltere] = useState(defaultFiltereValue(searchParams))
    const [loading, setLoading] = useState(false)
    const [avstemminger, setAvstemminger] = useState<AvstemmingContextValue['avstemminger']>(null)

    useEffect(
        function setDefaults() {
            const params = new URLSearchParams(window.location.search)
            const keys: (keyof typeof filtere)[] = ['fom', 'tom']
            for (const key of keys) {
                if (!params.get(key) && !!filtere[key]) {
                    params.set(key, filtere[key].toString())
                }
            }

            window.history.replaceState({}, '', `?${params.toString()}`)
        },
        [filtere]
    )

    useEffect(
        function fetchAvstemminger() {
            setLoading(true)
            fetch(`/api/avstemminger?fom=${dateComponent(filtere.fom)}&tom=${dateComponent(filtere.tom)}`)
                .then(async (res) => {
                    if (res.ok) {
                        const body = await res.json()
                        setAvstemminger({
                            data: body.data.map((it: string) => ({
                                xml: it,
                                avstemming: xmlToJson(it),
                            })),
                            error: null,
                        })
                    } else {
                        setAvstemminger({ data: null, error: res.statusText })
                    }
                })
                .catch((error) => {
                    setAvstemminger({ data: null, error: error.message })
                })
                .finally(() => setLoading(false))
        },
        [filtere]
    )

    const setFilter = (delta: Partial<AvstemmingFiltereValue>) => {
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
        window.history.replaceState({}, '', `${params.toString()}`)
    }

    return (
        <AvstemmingContext.Provider value={{ ...filtere, avstemminger, loading, setFiltere: setFilter }}>
            {children}
        </AvstemmingContext.Provider>
    )
}

export const useAvstemminger = () => {
    return useContext(AvstemmingContext)
}
