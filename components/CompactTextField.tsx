import clsx from 'clsx'
import React from 'react'
import { ErrorMessage, TextField, TextFieldProps } from '@navikt/ds-react'

type Props = Omit<TextFieldProps, 'size'> & {
    containerClass?: string
}

export const CompactTextField: React.FC<Props> = ({ className, containerClass, label, error, ...props }) => {
    const id = crypto.randomUUID()
    return (
        <div className={clsx('flex flex-col gap-2', containerClass)}>
            <div className="flex items-center relative">
                <label
                    className={clsx(
                        'h-8 bg-(--ax-bg-sunken) flex items-center py-0 px-2 rounded-l-lg border border-(--ax-border-neutral) border-r-0 text-sm whitespace-nowrap',
                        error && 'border-2 border-(--ax-border-danger)'
                    )}
                    htmlFor={id}
                >
                    {label}
                </label>
                <TextField
                    className={clsx('w-full [&_input]:rounded-l-none', error && 'border-2 border-(--ax-border-danger)')}
                    id={id}
                    label={label}
                    hideLabel
                    size="small"
                    {...props}
                />
            </div>
            {error && (
                <ErrorMessage size="small" showIcon>
                    {error}
                </ErrorMessage>
            )}
        </div>
    )
}
