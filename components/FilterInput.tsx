'use client'

import { TextFieldProps } from '@navikt/ds-react'
import React, { useEffect, useRef, useState } from 'react'

import { FiltereValue, useFiltere } from '@/app/kafka/Filtere'
import { Input } from './Input'

type TextFilter = {
    [K in keyof FiltereValue]: FiltereValue[K] extends string | null ? K : never
}[keyof FiltereValue]

type Props = Omit<TextFieldProps, 'onSearchClick' | 'onSubmit' | 'value' | 'onChange' | 'onKeyDown' | 'name'> & {
    filter: TextFilter
}

export function FilterInput({ filter, className, ...rest }: Props) {
    const { setFiltere, ...filtere } = useFiltere()
    const containerRef = useRef<HTMLDivElement>(null)

    const [value, setValue] = useState<string>(filtere[filter] ?? '')

    useEffect(
        function updateValueWhenFilterChanges() {
            setValue(filtere[filter] ?? '')
        },
        [filtere[filter]]
    )

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const value = (event.target as HTMLInputElement).value
            setFiltere({ [filter]: value })
        }
    }

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value)
    }

    const clearValue = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        setValue('')
        setFiltere({ [filter]: '' })
    }

    return (
        <Input
            className={className}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            name={filter}
            onClear={clearValue}
            containerRef={containerRef}
            {...rest}
        />
    )
}
