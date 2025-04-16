import React from 'react'
import clsx from 'clsx'
import { ComboboxProps, UNSAFE_Combobox } from '@navikt/ds-react'
import { useSearchParams } from 'next/navigation'

import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams.tsx'

type Props<T extends string> = Omit<ComboboxProps, 'options'> & {
    searchParamName: string
    initialOptions: T[]
    renderForSearchParam?: (value: string) => string
    renderForCombobox?: (value: string) => string
    size?: 'small' | 'medium'
}

export const UrlSearchParamComboBox = <T extends string>({
    searchParamName,
    initialOptions,
    renderForSearchParam = (value) => value,
    renderForCombobox = (value) => value,
    className,
    isMultiSelect,
    size = 'medium',
    ...rest
}: Props<T>) => {
    const searchParams = useSearchParams()
    const selectedOptions = searchParams.get(searchParamName)?.split(',') ?? []

    const updateSearchParams = useUpdateSearchParams(searchParamName)

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
            className={clsx(className)}
            isMultiSelect={isMultiSelect}
            options={initialOptions.map(renderForCombobox)}
            onToggleSelected={onToggleSelected}
            selectedOptions={selectedOptions.map(renderForCombobox)}
            size={size}
            {...rest}
        />
    )
}
