'use client'

import clsx from 'clsx'
import { Button, TextField, TextFieldProps } from '@navikt/ds-react'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { useUpdateSearchParams } from '@/hooks/useUpdateSearchParams.tsx'
import { XMarkIcon } from '@navikt/aksel-icons'

import styles from './UrlSearchParamInput.module.css'

type Props = Omit<TextFieldProps, 'onSearchClick'> & {
    searchParamName: string
}

export function UrlSearchParamInput({
    searchParamName,
    className,
    ...rest
}: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const searchParams = useSearchParams()
    const defaultValue: string = useMemo(
        () => (searchParams.get(searchParamName) ?? '') as string,
        [searchParams, searchParamName]
    )

    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (defaultValue !== value) {
            setValue(defaultValue)
        }
    }, [defaultValue, value])

    const updateSearchParams = useUpdateSearchParams(searchParamName)

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            updateSearchParams((event.target as HTMLInputElement).value)
        }
    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    const clearValue = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        setValue('')
        updateSearchParams('')
    }

    return (
        <div className={styles.container} ref={containerRef}>
            <TextField
                className={clsx(className, styles.textField)}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                name={searchParamName}
                {...rest}
            />
            {value.length > 0 && (
                <Button
                    variant="primary"
                    className={styles.clearButton}
                    type="button"
                    onClick={clearValue}
                >
                    <XMarkIcon />
                </Button>
            )}
        </div>
    )
}
