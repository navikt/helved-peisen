'use client'

import clsx from 'clsx'
import React, { useCallback, useEffect, useReducer } from 'react'
import { UrlSearchParamDateTimePicker } from '@/components/UrlSearchParamDateTimePicker.tsx'
import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'

import styles from './Filtere.module.css'
import { subDays } from 'date-fns'
import {
    ReadonlyURLSearchParams,
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation'

type FiltereState = {
    params: Record<string, string>
}

type UpdateSearchParamAction = {
    type: 'udateSearchParam'
    key: string
    value: string
}

type FiltereAction = UpdateSearchParamAction

const filtereReducer = (state: FiltereState, action: FiltereAction) => {
    switch (action.type) {
        case 'udateSearchParam': {
            return {
                ...state,
                params: {
                    ...state.params,
                    [action.key]: action.value,
                },
            }
        }
    }

    return state
}

const shouldUpdate = (
    searchParams: ReadonlyURLSearchParams,
    state: FiltereState
): boolean =>
    Object.entries(state.params).some(
        ([key, value]) => searchParams.get(key) !== value
    )

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [state, dispatch] = useReducer(filtereReducer, {
        params: {
            fom:
                searchParams.get('fom') ?? subDays(new Date(), 7).toISOString(),
            tom: searchParams.get('tom') ?? new Date().toISOString(),
        },
    })

    useEffect(() => {
        if (shouldUpdate(searchParams, state)) {
            const params = new URLSearchParams(searchParams.toString())

            for (const [key, value] of Object.entries(state.params)) {
                if (value.length === 0) {
                    params.delete(key)
                } else {
                    params.set(key, value)
                }

                if (params.size === 0) {
                    router.push(pathname)
                } else {
                    router.push(
                        pathname + '?' + decodeURIComponent(params.toString())
                    )
                }
            }
        }
    }, [searchParams, state, router, pathname])

    const updateFom = useCallback((value: string) => {
        dispatch({ type: 'udateSearchParam', key: 'fom', value })
    }, [])

    const updateTom = useCallback((value: string) => {
        dispatch({ type: 'udateSearchParam', key: 'tom', value })
    }, [])

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
                <UrlSearchParamDateTimePicker
                    label="Fra og med"
                    value={state.params.fom}
                    onUpdateValue={updateFom}
                />
                <UrlSearchParamDateTimePicker
                    label="Til og med"
                    value={state.params.tom}
                    onUpdateValue={updateTom}
                />
            </div>
        </div>
    )
}
