import clsx from 'clsx'
import React from 'react'
import { v4 } from 'uuid'
import { ErrorMessage, TextField, TextFieldProps } from '@navikt/ds-react'

import styles from './CompactTextField.module.css'

type Props = Omit<TextFieldProps, 'size'> & {
    containerClass?: string
}

export const CompactTextField: React.FC<Props> = ({
    className,
    containerClass,
    label,
    error,
    ...props
}) => {
    const id = v4()
    return (
        <div className={clsx(styles.container, containerClass)}>
            <div className={clsx(styles.inputContainer)}>
                <label
                    className={clsx(styles.label, error && styles.error)}
                    htmlFor={id}
                >
                    {label}
                </label>
                <TextField
                    className={clsx(styles.textField, error && styles.error)}
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
