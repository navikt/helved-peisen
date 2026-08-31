'use client'

import { subDays } from 'date-fns'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react'
import type { DashboardResponse } from '@/app/dashboard/types.ts'
import { ApiResponse } from '@/lib/api/types.ts'

type DashboardFiltereValue = {
    fom: string
    tom: string
}

type DashboardContextValue = DashboardFiltereValue & {
    dashboard: ApiResponse<DashboardResponse> | null
    loading: boolean
    refreshDashboard: () => Promise<void>
    setFiltere: (filtere: Partial<DashboardFiltereValue>) => void
}

const defaultFiltereValue = (searchParams?: ReadonlyURLSearchParams): DashboardFiltereValue => ({
    fom: searchParams?.get('fom') ?? subDays(new Date(), 3).toISOString(),
    tom: searchParams?.get('tom') ?? 'now',
})

const resolveDate = (value: string): string => (value === 'now' ? new Date().toISOString() : value)

export const DashboardContext = createContext<DashboardContextValue>({
    ...defaultFiltereValue(),
    dashboard: null,
    loading: false,
    refreshDashboard: async () => undefined,
    setFiltere: () => null,
})

export const DashboardProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const [filtere, setFiltere] = useState(defaultFiltereValue(searchParams))
    const [loading, setLoading] = useState(false)
    const [dashboard, setDashboard] = useState<ApiResponse<DashboardResponse> | null>(null)

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

    const refreshDashboard = useCallback(async () => {
        const fom = resolveDate(filtere.fom)
        const tom = resolveDate(filtere.tom)

        try {
            const response = await fetch(`/api/dashboard?fom=${fom}&tom=${tom}`)
            if (!response.ok) {
                throw response
            }
            setDashboard(await response.json())
        } catch (error) {
            console.error(error)
            setDashboard({
                data: null,
                error: 'Klarte ikke hente dashboard',
            })
        }
    }, [filtere.fom, filtere.tom])

    useEffect(() => {
        setLoading(true)
        void refreshDashboard().finally(() => setLoading(false))
    }, [refreshDashboard])

    const setFilter = (delta: Partial<DashboardFiltereValue>) => {
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
        <DashboardContext.Provider
            value={{
                ...filtere,
                dashboard,
                loading,
                refreshDashboard,
                setFiltere: setFilter,
            }}
        >
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboard = () => {
    return useContext(DashboardContext)
}
