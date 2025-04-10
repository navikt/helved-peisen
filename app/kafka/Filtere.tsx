'use client'

import clsx from 'clsx'
import React from 'react'
import { UrlSearchParamDateTimePicker } from '@/components/UrlSearchParamDateTimePicker.tsx'
import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox'
import { UrlSearchParamInput } from '@/components/UrlSearchParamInput.tsx'
import { addDays, subDays } from 'date-fns'

import styles from './Filtere.module.css'

type Props = React.HTMLAttributes<HTMLDivElement>

export const Filtere: React.FC<Props> = ({ className, ...rest }) => (
    <div className={clsx(styles.container, className)} {...rest}>
        <div className={clsx(styles.filters)}>
            <UrlSearchParamComboBox
                label="Topics"
                searchParamName="topics"
                initialOptions={
                    [
                        'helved.avstemming.v1',
                        'helved.oppdrag.v1',
                        'helved.oppdragsdata.v1',
                        'helved.dryrun-aap.v1',
                        'helved.dryrun-ts.v1',
                        'helved.dryrun-tp.v1',
                        'helved.dryrun-dp.v1',
                        'helved.kvittering.v1',
                        'helved.utbetalinger.v1',
                        'helved.utbetalinger-aap.v1',
                        'helved.saker.v1',
                        'helved.status.v1',
                        'helved.simuleringer.v1',
                    ] as const
                }
                isMultiSelect
            />
            <UrlSearchParamInput label="Key" searchParamName="key" />
            <UrlSearchParamDateTimePicker
                label="Fra og med"
                searchParamName="fom"
                defaultDate={subDays(new Date(), 30)}
            />
            <UrlSearchParamDateTimePicker
                label="Til og med"
                searchParamName="tom"
                defaultDate={addDays(new Date(), 1)}
            />
        </div>
    </div>
)
