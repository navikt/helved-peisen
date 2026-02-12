'use client'

import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { subDays } from 'date-fns'

import { FilterCombobox } from '@/components/FilterCombobox'
import { FilterInput } from '@/components/FilterInput'
import { DateRangeSelect } from '@/app/kafka/DateRangeSelect.tsx'
import { Topics } from '@/app/kafka/types.ts'

import { LiveButton } from './LiveButton'
import { RefreshButton } from './RefreshButton'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setFiltere, ...filtere } = React.useContext(FiltereContext)

    return (
        <div className={clsx('flex gap-6 justify-between flex-wrap', className)} {...rest}>
            <div className="flex flex-wrap gap-x-8 gap-y-5 items-end">
                <FilterCombobox
                    className="min-w-60"
                    label="Topics"
                    filter="topics"
                    initialOptions={Object.values(Topics)}
                    isMultiSelect
                />
                <FilterCombobox
                    label="Status"
                    filter="status"
                    initialOptions={['OK', 'FEILET', 'HOS_OPPDRAG', 'MOTTATT']}
                    isMultiSelect
                />
                <FilterInput label="Trace-ID" filter="trace_id" size="small" />
                <FilterInput label="Key" filter="key" size="small" />
                <FilterCombobox
                    label="Søk i value"
                    filter="value"
                    allowNewValues
                    initialOptions={[]}
                    isMultiSelect
                    hideDropdown
                />
                <DateRangeSelect
                    from={filtere.fom}
                    to={filtere.tom}
                    updateFrom={(fom: string) => setFiltere({ fom })}
                    updateTo={(tom: string) => setFiltere({ tom })}
                />
            </div>
            <div className="self-end flex gap-2">
                <LiveButton />
                <RefreshButton />
            </div>
        </div>
    )
}

export type FiltereValue = {
    fom: string
    tom: string
    topics: string | null
    status: string | null
    key: string | null
    value: string | null
    trace_id: string | null
    page: number
    pageSize: number
    orderBy: 'offset' | 'timestamp' | null
    direction: 'ASC' | 'DESC' | null
}

type FiltereContextValue = FiltereValue & {
    setFiltere: (filtere: Partial<FiltereValue>) => void
}

function defaultFiltereValue(searchParams?: ReadonlyURLSearchParams): FiltereValue {
    return {
        fom: searchParams?.get('fom') ?? subDays(new Date(), 3).toISOString(),
        tom: searchParams?.get('tom') ?? 'now',
        topics: searchParams?.get('topics') ?? null,
        status: searchParams?.get('status') ?? null,
        key: searchParams?.get('key') ?? null,
        value: searchParams?.get('value') ?? null,
        trace_id: searchParams?.get('trace_id') ?? null,
        page: 1,
        pageSize: 100,
        orderBy: 'timestamp',
        direction: 'DESC',
    }
}

export const FiltereContext = React.createContext<FiltereContextValue>({
    ...defaultFiltereValue(),
    setFiltere: () => null,
})

export const FiltereProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const [filtere, setFiltere] = useState<FiltereValue>(defaultFiltereValue(searchParams))

    useEffect(
        function setDefaults() {
            const params = new URLSearchParams(window.location.search)
            const keys: (keyof FiltereValue)[] = ['fom', 'tom', 'page', 'pageSize', 'orderBy', 'direction']
            for (const key of keys) {
                if (!params.get(key) && !!filtere[key]) {
                    params.set(key, filtere[key].toString())
                }
            }

            window.history.replaceState({}, '', `?${params.toString()}`)
        },
        [filtere]
    )

    const setFilter = (delta: Partial<FiltereValue>) => {
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

    return <FiltereContext.Provider value={{ ...filtere, setFiltere: setFilter }}>{children}</FiltereContext.Provider>
}

export function useFiltere() {
    return React.useContext(FiltereContext)
}
