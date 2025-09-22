'use client'

import clsx from 'clsx'
import React, { useEffect, useLayoutEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { subDays } from 'date-fns'

import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'
import { DateRangeSelect } from '@/app/kafka/DateRangeSelect.tsx'

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
            params.set('tom', today.toISOString())
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
    }, [state, router, pathname, searchParams])

    return (
        <div className={clsx('flex gap-4 justify-between flex-nowrap', className)} {...rest}>
            <div className="flex flex-wrap gap-x-8 gap-y-5">
                <UrlSearchParamComboBox
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
        </div>
    )
}
