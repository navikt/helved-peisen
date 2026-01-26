'use client'

import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { subDays } from 'date-fns'

import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'
import { DateRangeSelect } from '@/app/kafka/DateRangeSelect.tsx'
import { Switch, ToggleGroup } from '@navikt/ds-react'
import { ToggleGroupItem } from '@navikt/ds-react/ToggleGroup'
import { LiveButton } from './LiveButton'
import { RefreshButton } from './RefreshButton'
import { Topics } from '@/app/kafka/types.ts'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const { setFiltere, ...filtere } = React.useContext(FiltereContext)

    const updateFom = (fom: string) => setFiltere({ fom })

    const updateTom = (tom: string) => setFiltere({ tom })

    return (
        <div className={clsx('flex gap-6 justify-between flex-wrap', className)} {...rest}>
            <div className="flex flex-wrap gap-x-8 gap-y-5 items-end">
                <UrlSearchParamComboBox
                    className="min-w-[15rem]"
                    label="Topics"
                    searchParamName="topics"
                    initialOptions={Object.values(Topics)}
                    isMultiSelect
                    size="small"
                />
                <UrlSearchParamComboBox
                    label="Status"
                    searchParamName="status"
                    initialOptions={['OK', 'FEILET', 'HOS_OPPDRAG', 'MOTTATT']}
                    isMultiSelect
                    size="small"
                />
                <UrlSearchParamInput label="Trace-ID" searchParamName="trace_id" size="small" />
                <UrlSearchParamInput label="Key" searchParamName="key" size="small" />
                <UrlSearchParamComboBox
                    label="Søk i value"
                    searchParamName="value"
                    allowNewValues
                    initialOptions={[]}
                    isMultiSelect
                    size="small"
                    hideDropdown
                />
                <DateRangeSelect from={filtere.fom} to={filtere.tom} updateFrom={updateFom} updateTo={updateTom} />
                <ToggleGroup
                    className="h-max"
                    defaultValue="alle"
                    size="small"
                    onChange={(value) => setFiltere({ visning: value as 'alle' | 'siste' })}
                    value={filtere.visning}
                >
                    <ToggleGroupItem value="alle" label="Alle" />
                    <ToggleGroupItem value="siste" label="Siste" />
                </ToggleGroup>
                <Switch
                    className="h-max whitespace-nowrap"
                    value="utenKvittering"
                    size="small"
                    onChange={(event) => {
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
}

type FiltereContextValue = FiltereValue & {
    setFiltere: (filtere: Partial<FiltereValue>) => void
}

export const FiltereContext = React.createContext<FiltereContextValue>({
    fom: subDays(new Date(), 3).toISOString(),
    tom: 'now',
    topics: null,
    status: null,
    key: null,
    value: null,
    trace_id: null,
    utenKvittering: false,
    visning: 'alle',
    setFiltere: () => {
        throw new Error('setFilter is not implemented')
    },
})

export const FiltereProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const searchParams = useSearchParams()
    const [filtere, setFiltere] = useState<FiltereValue>({
        fom: subDays(new Date(), 3).toISOString(),
        tom: 'now',
        topics: null,
        status: searchParams.get('status') || null,
        key: null,
        value: null,
        trace_id: searchParams.get('trace_id') || null,
        utenKvittering: false,
        visning: 'alle',
    })

    useEffect(
        function setDefaultRange() {
            const params = new URLSearchParams(window.location.search)
            if (!params.get('fom')) {
                params.set('fom', filtere.fom)
            }
            if (!params.get('tom')) {
                params.set('tom', filtere.tom)
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
