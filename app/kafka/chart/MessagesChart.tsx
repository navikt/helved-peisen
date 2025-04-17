'use client'

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    ChartOptions,
    LinearScale,
} from 'chart.js'
import { Bar, getElementAtEvent } from 'react-chartjs-2'
import { add } from 'date-fns'
import { format } from 'date-fns/format'
import { Button, Skeleton } from '@navikt/ds-react'
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'

import { useMessageMap } from '@/app/kafka/chart/useMessageMap.ts'
import type { Message } from '@/app/kafka/types'
import { useSetSearchParams } from '@/hooks/useSetSearchParams.ts'

import fadeIn from '@/styles/fadeIn.module.css'
import styles from './MessagesChart.module.css'

Chart.register(BarElement, BarController, CategoryScale, LinearScale)

const FORMAT_STRING = 'MM-dd, HH:mm'

const formatDate = (date: string | Date) => {
    return format(date, FORMAT_STRING)
}

const validDate = (date: Date): boolean => {
    return !isNaN(date.valueOf())
}

const getCSSPropertyValue = (property: string) => {
    return getComputedStyle(
        document.body.getElementsByTagName('main')[0]
    ).getPropertyValue(property)
}

type Props = React.HTMLAttributes<HTMLDivElement> & {
    messages: Record<string, Message[]>
}

export const MessagesChart: React.FC<Props> = ({
    className,
    messages,
    ...rest
}) => {
    const searchParams = useSearchParams()
    const setSearchParams = useSetSearchParams()

    const [messageMap, increment] =
        useMessageMap(searchParams, Object.values(messages).flat()) ?? []

    const chartRef = useRef<Chart<'bar'>>(null)

    const onClickBar = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const chart = chartRef.current
        if (chart && messageMap && increment) {
            const element = getElementAtEvent(chart, event)[0]
            if (!element) {
                return
            }
            const fom = new Date(Object.keys(messageMap)[element.index])
            const tom = add(fom, { [increment]: 1 })

            if (!validDate(fom) || !validDate(tom)) {
                console.error('Klarte ikke parse fom/tom:', fom, tom)
                return
            }

            setSearchParams({ fom: fom.toISOString(), tom: tom.toISOString() })
        }
    }

    const [open, setOpen] = useState(true)

    const [colors, setColors] = useState({
        labelColor: '',
        barColor: '',
        borderColor: '',
        barHoverColor: '',
        gridColor: '',
    })

    const data = useMemo(
        () =>
            messageMap && {
                labels: Object.keys(messageMap).map(formatDate),
                datasets: [
                    {
                        data: Object.values(messageMap).map((it) => it.length),
                        backgroundColor: colors.barColor,
                        borderColor: colors.borderColor,
                        borderWidth: 1,
                        borderRadius: 5,
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
                    grid: {
                        color: colors.gridColor,
                    },
                },
                y: {
                    ticks: {
                        color: colors.labelColor,
                    },
                    grid: {
                        color: colors.gridColor,
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
                barColor: getCSSPropertyValue('--ax-bg-warning-moderateA'),
                borderColor: getCSSPropertyValue('--ax-border-warning'),
                barHoverColor: getCSSPropertyValue(
                    '--ax-bg-warning-moderate-hoverA'
                ),
                gridColor: getCSSPropertyValue('--ax-bg-neutral-soft'),
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
        return <MessagesChartSkeleton />
    }

    return (
        <div
            className={clsx(styles.container, fadeIn.animation, className)}
            {...rest}
        >
            <div className={clsx(styles.chartContainer, open && styles.open)}>
                <div className={styles.chart}>
                    <Bar
                        ref={chartRef}
                        options={options}
                        data={data}
                        onClick={onClickBar}
                    />
                </div>
            </div>
            <Button
                variant="tertiary-neutral"
                size="small"
                onClick={() => {
                    setOpen((open) => !open)
                }}
                className={styles.showButton}
            >
                {open ? (
                    <ChevronUpIcon fontSize="18" />
                ) : (
                    <ChevronDownIcon fontSize="18" />
                )}
            </Button>
        </div>
    )
}

export const MessagesChartSkeleton = () => {
    return <Skeleton className={styles.container} height={100} />
}
