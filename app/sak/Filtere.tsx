'use client'

import React from 'react'

import { UrlSearchParamInput } from '@/components/UrlSearchParamInput'

import styles from './Filtere.module.css'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => {
    return (
        <div className={styles.form} {...rest}>
            <UrlSearchParamInput
                searchParamName="sakId"
                label="Sak-ID"
                size="small"
            />
            <UrlSearchParamInput
                searchParamName="fagsystem"
                label="Fagsystem"
                size="small"
            />
        </div>
    )
}
