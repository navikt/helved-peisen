'use client'

import clsx from 'clsx'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import { subDays } from 'date-fns'

import { FilterCombobox } from '@/components/FilterCombobox'
import { FilterInput } from '@/components/FilterInput'
import { DateRangeSelect } from '@/app/kafka/DateRangeSelect.tsx'
import { Switch, ToggleGroup } from '@navikt/ds-react'
import { ToggleGroupItem } from '@navikt/ds-react/ToggleGroup'
import { LiveButton } from './LiveButton'
import { RefreshButton } from './RefreshButton'
import { Topics } from '@/app/kafka/types.ts'

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
                <ToggleGroup
                    className="h-max"
                    defaultValue="alle"
                    size="small"
                    onChange={(value: string) => setFiltere({ visning: value as 'alle' | 'siste' })}
                    value={filtere.visning}
                >
                    <ToggleGroupItem value="alle" label="Alle" />
                    <ToggleGroupItem value="siste" label="Siste" />
                </ToggleGroup>
                <Switch
                    className="h-max whitespace-nowrap"
                    value="utenKvittering"
                    size="small"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        if (event.target.checked) {
                            setFiltere({ utenKvittering: true, visning: 'siste' })
                        } else {
                            setFiltere({ utenKvittering: false })
                        }
                    }}
                >
                    Oppdrag uten kvittering
                </Switch>
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
    utenKvittering: boolean
    visning: 'alle' | 'siste'
    page: number
    pageSize: number
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
        utenKvittering: false,
        visning: 'alle',
        page: 1,
        pageSize: 100,
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
            if (!params.get('fom')) {
                params.set('fom', filtere.fom)
            }
            if (!params.get('tom')) {
                params.set('tom', filtere.tom)
            }
            if (!params.get('page')) {
                params.set('page', filtere.page.toString())
            }
            if (!params.get('pageSize')) {
                params.set('pageSize', filtere.pageSize.toString())
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
