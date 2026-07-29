'use client'

import { subDays } from 'date-fns'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import {
    getDashboardSummary,
    getDobbeltutbetalingSummary,
    getManglendeKvitteringSummary,
} from '@/app/dashboard/actions.ts'
import type {
    DashboardSection,
    DashboardSummary,
    DobbeltutbetalingCandidate,
    ManglendeKvittering,
} from '@/app/dashboard/types.ts'

type DashboardFiltereValue = {
    fom: string
    tom: string
}

type DashboardContextValue = DashboardFiltereValue & {
    loading: boolean
    summary: DashboardSummary | null
    manglendeKvittering: DashboardSection<ManglendeKvittering[]> | null
    manglendeKvitteringLoading: boolean
    dobbeltutbetalinger: DashboardSection<DobbeltutbetalingCandidate[]> | null
    dobbeltutbetalingerLoading: boolean
    setFiltere: (filtere: Partial<DashboardFiltereValue>) => void
}

const defaultFiltereValue = (searchParams?: ReadonlyURLSearchParams): DashboardFiltereValue => ({
    fom: searchParams?.get('fom') ?? subDays(new Date(), 3).toISOString(),
    tom: searchParams?.get('tom') ?? 'now',
})

const resolveDate = (value: string): string => (value === 'now' ? new Date().toISOString() : value)

export const DashboardContext = createContext<DashboardContextValue>({
    ...defaultFiltereValue(),
    loading: false,
    summary: null,
    manglendeKvittering: null,
    manglendeKvitteringLoading: false,
    dobbeltutbetalinger: null,
    dobbeltutbetalingerLoading: false,
    setFiltere: () => null,
})

export const DashboardProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const [filtere, setFiltere] = useState(defaultFiltereValue(searchParams))
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [manglendeKvittering, setManglendeKvittering] = useState<DashboardSection<ManglendeKvittering[]> | null>(
        null
    )
    const [manglendeKvitteringLoading, setManglendeKvitteringLoading] = useState(false)
    const [dobbeltutbetalinger, setDobbeltutbetalinger] = useState<DashboardSection<
        DobbeltutbetalingCandidate[]
    > | null>(null)
    const [dobbeltutbetalingerLoading, setDobbeltutbetalingerLoading] = useState(false)

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
        function fetchSummary() {
            let cancelled = false
            const fom = resolveDate(filtere.fom)
            const tom = resolveDate(filtere.tom)

            setLoading(true)
            getDashboardSummary(fom, tom)
                .then((data) => {
                    if (!cancelled) setSummary(data)
                })
                .finally(() => {
                    if (!cancelled) setLoading(false)
                })

            setManglendeKvitteringLoading(true)
            getManglendeKvitteringSummary(fom, tom)
                .then((data) => {
                    if (!cancelled) setManglendeKvittering(data)
                })
                .finally(() => {
                    if (!cancelled) setManglendeKvitteringLoading(false)
                })

            setDobbeltutbetalingerLoading(true)
            getDobbeltutbetalingSummary(fom, tom)
                .then((data) => {
                    if (!cancelled) setDobbeltutbetalinger(data)
                })
                .finally(() => {
                    if (!cancelled) setDobbeltutbetalingerLoading(false)
                })

            return () => {
                cancelled = true
            }
        },
        [filtere]
    )

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
                summary,
                loading,
                manglendeKvittering,
                manglendeKvitteringLoading,
                dobbeltutbetalinger,
                dobbeltutbetalingerLoading,
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
