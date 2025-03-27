'use client'

import React, { useLayoutEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Bar } from 'react-chartjs-2'
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    ChartOptions,
    LinearScale,
} from 'chart.js'
import { format } from 'date-fns/format'

import type { Message } from '@/app/kafka/timeline/types'
import { useMessageMap } from '@/app/kafka/timeline/useMessageMap.ts'

import styles from './MessagesChart.module.css'

Chart.register(BarElement, BarController, CategoryScale, LinearScale)

const messages: Record<string, Message[]> = {
    'helved.oppdrag.v1': [
        {
            key: '1',
            timestamp: '2025-03-25T23:00:00.000Z',
            data: '',
        },
        {
            key: '2',
            timestamp: '2025-03-25T22:00:00.000Z',
            data: '',
        },
        {
            key: '3',
            timestamp: '2025-03-25T21:00:00.000Z',
            data: '',
        },
        {
            key: '4',
            timestamp: '2025-03-24T23:00:00.000Z',
            data: '',
        },
        {
            key: '5',
            timestamp: '2025-03-23T23:00:00.000Z',
            data: '',
        },
    ],
    'helved.simuleringer.v1': [],
    'helved.dryrun-aap.v1': [],
    'helved.dryrun-ts.v1': [
        {
            key: '6',
            timestamp: '2025-03-21T23:00:00.000Z',
            data: '',
        },
        {
            key: '7',
            timestamp: '2025-03-20T23:00:00.000Z',
            data: '',
        },
    ],
    'helved.dryrun-tp.v1': [],
    'helved.kvittering.v1': [],
    'helved.status.v1': [],
    'helved.kvittering-queue.v1': [],
}

const getCSSPropertyValue = (property: string) => {
    return getComputedStyle(
        document.body.getElementsByTagName('main')[0]
    ).getPropertyValue(property)
}

type Props = React.HTMLAttributes<HTMLDivElement>

export const MessagesChart: React.FC<Props> = ({ className, ...rest }) => {
    const messageMap = useMessageMap(Object.values(messages).flat())

    const [colors, setColors] = useState({
        labelColor: '',
        barColor: '',
        barHoverColor: '',
    })

    const data = useMemo(
        () =>
            messageMap && {
                labels: Object.keys(messageMap).map((it) =>
                    format(it, 'yyyy-MM-dd, HH:mm')
                ),
                datasets: [
                    {
                        data: Object.values(messageMap).map((it) => it.length),
                        barPercentage: 1,
                        categoryPercentage: 1,
                        backgroundColor: colors.barColor,
                        hoverBackgroundColor: colors.barHoverColor,
                    },
                ],
            },
        [messageMap, colors]
    )

    const options: ChartOptions<'bar'> = useMemo(
        () => ({
            animation: {
                duration: 0,
            },
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: colors.labelColor,
                    },
                },
                y: {
                    ticks: {
                        color: colors.labelColor,
                    },
                },
            },
        }),
        [colors]
    )

    useLayoutEffect(() => {
        const updateColor = () => {
            setColors({
                labelColor: getCSSPropertyValue('--ax-text-neutral'),
                barColor: getCSSPropertyValue('--ax-bg-accent-strong'),
                barHoverColor: getCSSPropertyValue(
                    '--ax-bg-accent-strong-hover'
                ),
            })
        }

        updateColor()

        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', updateColor)

        return () => {
            window
                .matchMedia('(prefers-color-scheme: dark)')
                .removeEventListener('change', updateColor)
        }
    }, [])

    if (!data) {
        return null
    }

    return (
        <div className={clsx(styles.container, className)} {...rest}>
            <Bar options={options} data={data} />
        </div>
    )
}
