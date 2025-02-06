'use client'

import { TextField, TextFieldProps } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { ChangeEvent } from 'react'

import styles from './UrlSearchParamInput.module.css'
import clsx from 'clsx'

type Props = Omit<TextFieldProps, 'onSearchClick'> & {
    searchParamName: string
}

export function UrlSearchParamInput({ searchParamName, className, ...rest }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const defaultValue: string = (searchParams.get(searchParamName) ??
        rest.defaultValue ??
        '') as string

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
            className={clsx(className, styles.input)}
            defaultValue={defaultValue}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            name={searchParamName}
            {...rest}
        />
    )
}
