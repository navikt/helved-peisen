'use client'

import clsx from 'clsx'
import React from 'react'
import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox.tsx'
import { DateTimePicker } from '@/components/DateTimePicker.tsx'

import styles from './Filtere.module.css'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => (
    <div className={clsx(styles.container, className)} {...rest}>
        <div className={clsx(styles.filters)}>
            <UrlSearchParamComboBox
                label="Topics"
                searchParamName="topics"
                initialOptions={
                    ['helved.oppdrag.v1', 'helved.simuleringer.v1', 'helved.dryrun-aap.v1', 'helved.dryrun-ts.v1', 'helved.dryrun-tp.v1', 'helved.kvittering.v1',
                    'helved.status.v1','helved.kvittering-queue.v1' ] as const
                }
                isMultiSelect
            />
            <DateTimePicker label="Fra og med" />
            <DateTimePicker label="Til og med" />
        </div>
    </div>
)
