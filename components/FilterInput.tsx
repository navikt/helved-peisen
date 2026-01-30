'use client'

import clsx from 'clsx'
import { Button, TextField, TextFieldProps } from '@navikt/ds-react'
import { XMarkIcon } from '@navikt/aksel-icons'
import React, { useEffect, useRef, useState } from 'react'

import { FiltereValue, useFiltere } from '@/app/kafka/Filtere'

type Props = Omit<TextFieldProps, 'onSearchClick' | 'onSubmit'> & {
    filter: keyof FiltereValue
}

export function FilterInput({ filter, className, ...rest }: Props) {
    const { setFiltere, ...filtere } = useFiltere()
    const containerRef = useRef<HTMLDivElement>(null)

    const [value, setValue] = useState<string>((filtere[filter] as string) ?? '')

    useEffect(
        function updateValueWhenFilterChanges() {
            if (filtere[filter]) {
                setValue(filtere[filter] as string)
            }
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
        <div className="relative" ref={containerRef}>
            <TextField
                className={clsx(className, '[&>input]:pr-8')}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                name={filter}
                {...rest}
            />
            {value.length > 0 && (
                <Button
                    variant="primary"
                    className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-l-none"
                    type="button"
                    onClick={clearValue}
                >
                    <XMarkIcon />
                </Button>
            )}
        </div>
    )
}
