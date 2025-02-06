import React from 'react'
import { ComboboxProps, UNSAFE_Combobox } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import styles from './UrlSearchParamComboBox.module.css'
import clsx from 'clsx'

type Props<T extends string> = Omit<ComboboxProps, 'options'> & {
    searchParamName: string
    initialOptions: T[]
    renderForSearchParam?: (value: string) => string
    renderForCombobox?: (value: string) => string
}

export const UrlSearchParamComboBox = <T extends string>({
    searchParamName,
    initialOptions,
    renderForSearchParam = (value) => value,
    renderForCombobox = (value) => value,
    className,
    isMultiSelect,
    ...rest
}: Props<T>) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const selectedOptions = searchParams.get(searchParamName)?.split(',') ?? []

    const updateSearchParams = (query: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (query.length === 0) {
            params.delete(searchParamName)
        } else {
            params.set(searchParamName, query)
        }

        if (params.size === 0) {
            router.push(pathname)
        } else {
            router.push(pathname + '?' + decodeURIComponent(params.toString()))
        }
    }

    const onToggleSelected = (option: string, isSelected: boolean) => {
        if (isMultiSelect) {
            if (isSelected) {
                const query = [...selectedOptions, option as T]
                    .map(renderForSearchParam)
                    .join(',')
                updateSearchParams(query)
            } else {
                const query = selectedOptions
                    .map(renderForSearchParam)
                    .filter((o) => o !== renderForSearchParam(option))
                    .join(',')
                updateSearchParams(query)
            }
        } else {
            if (isSelected) {
                updateSearchParams(renderForSearchParam(option))
            } else {
                updateSearchParams('')
            }
        }
    }

    return (
        <UNSAFE_Combobox
            className={clsx(className, styles.combobox)}
            isMultiSelect={isMultiSelect}
            options={initialOptions.map(renderForCombobox)}
            onToggleSelected={onToggleSelected}
            selectedOptions={selectedOptions.map(renderForCombobox)}
            {...rest}
        />
    )
}
