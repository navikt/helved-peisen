'use client'

import React, { useLayoutEffect, useState } from 'react'
import clsx from 'clsx'
import { v4 } from 'uuid'
import { Bar } from 'react-chartjs-2'
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    ChartOptions,
    LinearScale,
} from 'chart.js'

import type { Message } from '@/app/kafka/timeline/types'
import { useMessageMap } from '@/app/kafka/timeline/useMessageMap.ts'

import styles from './MessagesChart.module.css'
import { format } from 'date-fns/format'

Chart.register(BarElement, BarController, CategoryScale, LinearScale)

const getCSSPropertyValue = (property: string) => {
    return getComputedStyle(
        document.body.getElementsByTagName('main')[0]
    ).getPropertyValue(property)
}

const messages: Record<string, Message[]> = {
    'helved.oppdrag.v1': [
        {
            key: v4(),
            timestamp: '2025-03-25T23:00:00.000Z',
            data: '',
        },
        {
            key: v4(),
            timestamp: '2025-03-25T22:00:00.000Z',
            data: '',
        },
        {
            key: v4(),
            timestamp: '2025-03-25T21:00:00.000Z',
            data: '',
        },
        {
            key: v4(),
            timestamp: '2025-03-24T23:00:00.000Z',
            data: '',
        },
        {
            key: v4(),
            timestamp: '2025-03-23T23:00:00.000Z',
            data: '',
        },
    ],
    'helved.simuleringer.v1': [],
    'helved.dryrun-aap.v1': [],
    'helved.dryrun-ts.v1': [
        {
            key: v4(),
            timestamp: '2025-03-21T23:00:00.000Z',
            data: '',
        },
        {
            key: v4(),
            timestamp: '2025-03-20T23:00:00.000Z',
            data: '',
        },
    ],
    'helved.dryrun-tp.v1': [],
    'helved.kvittering.v1': [],
    'helved.status.v1': [],
    'helved.kvittering-queue.v1': [],
}

type Props = React.HTMLAttributes<HTMLDivElement>

export const MessagesChart: React.FC<Props> = ({ className, ...rest }) => {
    const messageMap = useMessageMap(Object.values(messages).flat())

    const [colors, setColors] = useState({
        labelColor: '',
        barColor: '',
        barHoverColor: '',
    })

    const data = {
        labels: Object.keys(messageMap).map(it => format(it, "yyyy-MM-dd, HH:mm")),
        datasets: [
            {
                data: Object.values(messageMap).map((it) => it.length),
                barPercentage: 1,
                categoryPercentage: 1,
                backgroundColor: colors.barColor,
                hoverBackgroundColor: colors.barHoverColor,
            },
        ],
    }

    const options: ChartOptions<'bar'> = {
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
    }

    useLayoutEffect(() => {
        const updateColor = () => {
            setColors({
                labelColor: getCSSPropertyValue('--ax-text-neutral-subtle'),
                barColor: getCSSPropertyValue('--ax-bg-accent-strong'),
                barHoverColor: getCSSPropertyValue('--ax-bg-accent-strong-hover'),
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

    return (
        <div className={clsx(styles.container, className)} {...rest}>
            <Bar options={options} data={data} />
        </div>
    )
}
