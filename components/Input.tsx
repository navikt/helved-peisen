import React, { Ref } from 'react'
import { Button, TextField, TextFieldProps } from '@navikt/ds-react'
import clsx from 'clsx'
import { XMarkIcon } from '@navikt/aksel-icons'

type Props = TextFieldProps & {
    value: string
    containerRef?: Ref<HTMLDivElement>
    onClear: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export const Input: React.FC<Props> = ({ value, onClear, containerRef, children, size, ...rest }) => {
    return (
        <div className="relative" ref={containerRef}>
            <TextField
                className={clsx(rest.className, '[&>input]:pr-8')}
                value={value}
                size={size ?? 'small'}
                {...rest}
            />
            {value.length > 0 && (
                <Button
                    variant="primary"
                    className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-l-none"
                    type="button"
                    onClick={onClear}
                >
                    <XMarkIcon />
                </Button>
            )}
        </div>
    )
}
