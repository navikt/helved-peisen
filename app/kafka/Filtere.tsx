'use client'

import clsx from 'clsx'
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { subDays } from 'date-fns'

import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'
import { DateRangeSelect } from '@/app/kafka/DateRangeSelect.tsx'
import { Checkbox, ToggleGroup } from '@navikt/ds-react'
import { ToggleGroupItem } from '@navikt/ds-react/ToggleGroup'

const useDefaultTidsrom = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const params = new URLSearchParams(searchParams)
        const today = new Date()
        const isMonday = today.getDay() === 1
        const daysToSubtract = isMonday ? 3 : 1

        if (!params.has('fom')) {
            params.set('fom', subDays(today, daysToSubtract).toISOString())
        }
        if (!params.has('tom')) {
            params.set('tom', 'now')
        }

        if (params.toString() !== searchParams.toString()) {
            router.push(`?${params.toString()}`, { scroll: false })
        }
    }, [searchParams, router])
}

const shouldUpdate = (searchParams: URLSearchParams, state: Record<string, string | null>): boolean =>
    Object.entries(state).some(([key, value]) => searchParams.get(key) !== value)

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { setFiltere, ...filtere } = React.useContext(FiltereContext)

    const state: Record<string, string | null> = useMemo(() => {
        return {
            fom: searchParams.get('fom'),
            tom: searchParams.get('tom'),
            topics: searchParams.get('topics'),
        }
    }, [searchParams])

    useDefaultTidsrom()

    useLayoutEffect(() => {
        // Oppdaterer search parameters med verdiene i state.params
        if (shouldUpdate(searchParams, state)) {
            setFiltere(state)
            const search = new URLSearchParams(searchParams.toString())
            for (const [key, value] of Object.entries(state)) {
                if (!value || value.length === 0) {
                    search.delete(key)
                } else {
                    search.set(key, value)
                }
            }

            if (search.size === 0) {
                router.push(pathname)
            } else {
                router.push(pathname + '?' + decodeURIComponent(search.toString()))
            }
        }
    }, [state, router, pathname, searchParams, setFiltere])

    return (
        <div className={clsx('flex gap-6 justify-between flex-wrap', className)} {...rest}>
            <div className="flex flex-wrap gap-x-8 gap-y-5">
                <UrlSearchParamComboBox
                    className="min-w-[15rem]"
                    label="Topics"
                    searchParamName="topics"
                    initialOptions={
                        [
                            'helved.avstemming.v1',
                            'helved.oppdrag.v1',
                            'helved.oppdragsdata.v1',
                            'helved.dryrun-aap.v1',
                            'helved.dryrun-ts.v1',
                            'helved.dryrun-tp.v1',
                            'helved.dryrun-dp.v1',
                            'helved.kvittering.v1',
                            'helved.utbetalinger.v1',
                            'helved.utbetalinger-aap.v1',
                            'helved.utbetalinger-dp.v1',
                            'teamdagpenger.utbetaling.v1',
                            'helved.saker.v1',
                            'helved.status.v1',
                            'helved.simuleringer.v1',
                        ] as const
                    }
                    isMultiSelect
                    size="small"
                />
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
                <DateRangeSelect />
            </div>
            <div className="self-end flex gap-4">
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
                <Checkbox
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
                </Checkbox>
            </div>
        </div>
    )
}

export type Filtere = {
    fom: string | null
    tom: string | null
    topics: string | null
    key: string | null
    value: string | null
    utenKvittering: boolean
    visning: 'alle' | 'siste'
}

type FiltereContextValue = Filtere & {
    setFiltere: (filtere: Partial<Filtere>) => void
}

export const FiltereContext = React.createContext<FiltereContextValue>({
    fom: null,
    tom: null,
    topics: null,
    key: null,
    value: null,
    utenKvittering: false,
    visning: 'alle',
    setFiltere: () => {
        throw new Error('setFilter is not implemented')
    },
})

export const FiltereProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [filtere, setFiltere] = useState<Filtere>({
        fom: null,
        tom: null,
        topics: null,
        key: null,
        value: null,
        utenKvittering: false,
        visning: 'alle',
    })

    const setFilter = (filtere: Partial<Filtere>) => {
        setFiltere((prev) => ({ ...prev, ...filtere }))
    }

    return <FiltereContext.Provider value={{ ...filtere, setFiltere: setFilter }}>{children}</FiltereContext.Provider>
}
