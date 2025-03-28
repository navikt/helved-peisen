'use client'

import React, { useLayoutEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    ChartOptions,
    LinearScale,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { format } from 'date-fns/format'
import { Label } from '@navikt/ds-react'

import { useMessageMap } from '@/app/kafka/chart/useMessageMap.ts'
import type { Message } from '@/app/kafka/types'

import styles from './MessagesChart.module.css'

Chart.register(BarElement, BarController, CategoryScale, LinearScale)

const getCSSPropertyValue = (property: string) => {
    return getComputedStyle(
        document.body.getElementsByTagName('main')[0]
    ).getPropertyValue(property)
}

type Props = React.HTMLAttributes<HTMLDivElement> & {
    searchParams: SearchParams
    messages: Record<string, Message[]>
}

export const MessagesChart: React.FC<Props> = ({
    className,
    searchParams,
    messages,
    ...rest
}) => {
    const messageMap = useMessageMap(
        searchParams,
        Object.values(messages).flat()
    )

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
                barColor: getCSSPropertyValue(
                    '--ax-warning-900'
                ),
                barHoverColor: getCSSPropertyValue(
                    '--ax-warning-1000'
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
            <Label>Meldinger</Label>
            <div className={styles.chart}>
                <Bar options={options} data={data} />
            </div>
        </div>
    )
}
