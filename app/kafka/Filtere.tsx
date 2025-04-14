'use client'

import clsx from 'clsx'
import React, { useCallback, useEffect, useMemo } from 'react'
import { subDays } from 'date-fns'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { UrlSearchParamDateTimePicker } from '@/components/UrlSearchParamDateTimePicker.tsx'
import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'
import { useSetSearchParams } from '@/hooks/useSetSearchParams.ts'

import styles from './Filtere.module.css'

const shouldUpdate = (
    searchParams: URLSearchParams,
    state: Record<string, string | null>
): boolean =>
    Object.entries(state).some(
        ([key, value]) => searchParams.get(key) !== value
    )

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const state: Record<string, string | null> = useMemo(() => {
        return {
            fom:
                searchParams.get('fom') ?? subDays(new Date(), 7).toISOString(),
            tom: searchParams.get('tom') ?? new Date().toISOString(),
            limit: searchParams.get('limit'),
            topics: searchParams.get('topics'),
        }
    }, [searchParams])
    const setSearchParams = useSetSearchParams()

    useEffect(() => {
        // Oppdaterer search parameters med verdiene i state.params
        const search = new URLSearchParams(window.location.search)
        if (shouldUpdate(search, state)) {
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
                router.push(
                    pathname + '?' + decodeURIComponent(search.toString())
                )
            }
        }
    }, [state, router, pathname])

    const updateFom = useCallback(
        (value: string) => {
            setSearchParams({ fom: value })
        },
        [setSearchParams]
    )

    const updateTom = useCallback(
        (value: string) => {
            setSearchParams({ tom: value })
        },
        [setSearchParams]
    )

    return (
        <div className={clsx(styles.container, className)} {...rest}>
            <div className={clsx(styles.filters)}>
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
                            'helved.saker.v1',
                            'helved.status.v1',
                            'helved.simuleringer.v1',
                        ] as const
                    }
                    isMultiSelect
                />
                <UrlSearchParamInput label="Key" searchParamName="key" />
                <UrlSearchParamInput label="Value" searchParamName="value" />
                <UrlSearchParamInput label="Limit" searchParamName="limit" />
                <UrlSearchParamDateTimePicker
                    label="Fra og med"
                    value={state.fom!}
                    onUpdateValue={updateFom}
                />
                <UrlSearchParamDateTimePicker
                    label="Til og med"
                    value={state.tom!}
                    onUpdateValue={updateTom}
                />
            </div>
        </div>
    )
}
