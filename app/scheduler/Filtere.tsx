'use client'

import clsx from 'clsx'
import React from 'react'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'
import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox.tsx'
import { deslugify, slugifyUpperCase } from '@/lib/string.ts'

import styles from './Filtere.module.css'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => (
    <div className={clsx(styles.container, className)} {...rest}>
        <div className={clsx(styles.filters, styles.visible)}>
            <UrlSearchParamComboBox
                label="Status"
                searchParamName="status"
                initialOptions={
                    ['COMPLETE', 'IN_PROGRESS', 'FAIL', 'MANUAL'] as const
                }
                isMultiSelect
                renderForSearchParam={slugifyUpperCase}
                renderForCombobox={deslugify}
                size="small"
            />
            <UrlSearchParamComboBox
                label="Type"
                searchParamName="kind"
                shouldAutocomplete
                initialOptions={
                    ['Avstemming', 'Iverksetting', 'SjekkStatus', 'StatusUtbetaling', 'Utbetaling'] as const
                }
                isMultiSelect
                size="small"
            />
            <UrlSearchParamInput
                className={styles.input}
                label="Søk i payload"
                searchParamName="payload"
                size="small"
            />
        </div>
    </div>
)
