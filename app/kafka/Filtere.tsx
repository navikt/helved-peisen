'use client'

import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { subDays } from 'date-fns'

import { FilterCombobox } from '@/components/FilterCombobox'
import { FilterInput } from '@/components/FilterInput'
import { DateRangeSelect } from '@/components/DateRangeSelect'
import { Topics } from '@/app/kafka/types.ts'
import { HStack } from '@navikt/ds-react'
import { LiveButton } from '@/app/kafka/LiveButton.tsx'
import { RefreshButton } from '@/app/kafka/RefreshButton.tsx'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setFiltere, ...filtere } = React.useContext(FiltereContext)

    return (
        <div className={clsx('flex flex-col gap-6 justify-between', className)} {...rest}>
            <div className="grid grid-cols-2 ax-md:grid-cols-3 ax-lg:grid-cols-4 ax-xl:flex ax-xl:flex-wrap gap-x-8 gap-y-5 items-end">
                <FilterCombobox
                    className="ax-xl:min-w-60"
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
                    size="small"
                />
                <FilterCombobox
                    label="Fagsystem"
                    filter="fagsystem"
                    initialOptions={['AAP', 'DAGPENGER', 'TILLEGGSSTØNADER', 'TILTAKSPENGER', 'HISTORISK']}
                    isMultiSelect
                    size="small"
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
                <HStack align="center" gap="space-8">
                    <LiveButton />
                    <RefreshButton />
                </HStack>
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
    fagsystem: string | null
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
        fagsystem: searchParams?.get('fagsystem') ?? null,
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
