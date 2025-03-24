'use client'

import clsx from 'clsx'
import React from 'react'
import { UrlSearchParamComboBox } from '@/components/UrlSearchParamComboBox.tsx'

import styles from './Filtere.module.css'

type Props = React.HTMLAttributes<HTMLDivElement>
import { DateTimePicker } from '@/components/DateTimePicker.tsx'

export const KafkaFiltere: React.FC<Props> = ({ className, ...rest }) => (
    <div className={clsx(styles.container, className)} {...rest}>
        <div className={clsx(styles.filters, styles.visible)}>
            <UrlSearchParamComboBox
                label="Topics"
                searchParamName="topics"
                initialOptions={
                    ['helved.oppdrag.v1', 'helved.simuleringer.v1', 'helved.dryrun-aap.v1', 'helved.dryrun-ts.v1', 'helved.dryrun-tp.v1', 'helved.kvittering.v1',
                    'helved.status.v1','helved.kvittering-queue.v1' ] as const
                }
                isMultiSelect
            />
            <DateTimePicker/>
        </div>
    </div>
)
