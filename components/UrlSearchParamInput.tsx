'use client'

import clsx from 'clsx'
import { TextField, TextFieldProps } from '@navikt/ds-react'
import { useSearchParams } from 'next/navigation'
import React, { ChangeEvent } from 'react'

import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams.tsx'

type Props = Omit<TextFieldProps, 'onSearchClick'> & {
    searchParamName: string
}

export function UrlSearchParamInput({
    searchParamName,
    className,
    ...rest
}: Props) {
    const searchParams = useSearchParams()

    const defaultValue: string = (searchParams.get(searchParamName) ??
        rest.defaultValue ??
        '') as string

    const updateSearchParams = useUpdateSearchParams(searchParamName)

    const onBlur = (event: ChangeEvent<HTMLInputElement>) => {
        updateSearchParams(event.target.value)
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            updateSearchParams((event.target as HTMLInputElement).value)
        }
    }

    return (
        <TextField
            className={clsx(className)}
            defaultValue={defaultValue}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            name={searchParamName}
            {...rest}
        />
    )
}
