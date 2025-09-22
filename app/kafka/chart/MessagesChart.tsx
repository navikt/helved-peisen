'use client'

import React, { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import clsx from 'clsx'
import { BarController, BarElement, CategoryScale, Chart, ChartOptions, LinearScale } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { parse } from 'date-fns/parse'
import { Button, Skeleton } from '@navikt/ds-react'
import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons'

import { useMessageMap } from '@/app/kafka/chart/useMessageMap.ts'
import type { Message } from '@/app/kafka/types'
import { useSetSearchParams } from '@/hooks/useSetSearchParams.ts'
import { formatDate } from './date'
import { getCSSPropertyValue } from './css'
import { BrushPlugin } from './brush'

Chart.register(BarElement, BarController, CategoryScale, LinearScale, BrushPlugin)

type Colors = {
    labelColor: string
    barColor: string
    borderColor: string
    barHoverColor: string
    gridColor: string
}

type MessageMap = Record<string, Message[]>

type Increment = 'days' | 'hours' | 'minutes'

const useChartData = (colors: Colors, messages?: MessageMap, increment?: Increment) => {
    return useMemo(
        () =>
            messages &&
            increment && {
                labels: Object.keys(messages).map((it) => formatDate(it, increment)),
                datasets: [
                    {
                        data: Object.values(messages).map((it) => it.length),
                        backgroundColor: colors.barColor,
                        borderColor: colors.borderColor,
                        borderWidth: 1,
                        borderRadius: 5,
                        hoverBackgroundColor: colors.barHoverColor,
                    },
                ],
            },
        [messages, colors, increment]
    )
}

const useChartOptions = (colors: Colors): ChartOptions<'bar'> => {
    const setSearchParams = useSetSearchParams()
    return useMemo(
        () => ({
            animation: { duration: 0 },
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: colors.labelColor }, grid: { color: colors.gridColor } },
                y: { ticks: { color: colors.labelColor }, grid: { color: colors.gridColor } },
            },
            events: ['mousemove', 'mouseout', 'mousedown', 'mouseup', 'click'],
            plugins: {
                brush: {
                    strokeStyle: getCSSPropertyValue('--ax-border-accent-subtleA'),
                    fillStyle: getCSSPropertyValue('--ax-bg-info-moderateA'),
                    minPixels: 6,
                    onSelect: ({ min, max }, chart) => {
                        const x = (chart.scales as any).x
                        const minDate = x.getLabelForValue(min)
                        const maxDate = x.getLabelForValue(Math.max(max, min + 1))

                        if (typeof minDate !== 'string' || typeof maxDate !== 'string') {
                            return
                        }

                        const fom = new Date(parse(minDate, 'MM-dd, HH:mm', new Date()))
                        const tom = new Date(parse(maxDate, 'MM-dd, HH:mm', new Date()))

                        setSearchParams({ fom: fom.toISOString(), tom: tom.toISOString() })
                    },
                },
            },
        }),
        [colors, setSearchParams]
    )
}

const useColors = () => {
    const [colors, setColors] = useState({
        labelColor: '',
        barColor: '',
        borderColor: '',
        barHoverColor: '',
        gridColor: '',
    })

    useLayoutEffect(() => {
        const updateColor = () => {
            setColors({
                labelColor: getCSSPropertyValue('--ax-text-neutral'),
                barColor: getCSSPropertyValue('--ax-bg-warning-moderateA'),
                borderColor: getCSSPropertyValue('--ax-border-warning'),
                barHoverColor: getCSSPropertyValue('--ax-bg-warning-moderate-hoverA'),
                gridColor: getCSSPropertyValue('--ax-bg-neutral-soft'),
            })
        }

        updateColor()

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateColor)

        return () => {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', updateColor)
        }
    }, [])

    return colors
}

type Props = React.HTMLAttributes<HTMLDivElement> & {
    messages: Record<string, Message[]>
}

export const MessagesChart: React.FC<Props> = ({ className, messages, ...rest }) => {
    const searchParams = useSearchParams()
    const chartRef = useRef<Chart<'bar'>>(null)

    const [messageMap, increment] = useMessageMap(searchParams, Object.values(messages).flat()) ?? []
    const [open, setOpen] = useState(true)

    const colors = useColors()
    const data = useChartData(colors, messageMap, increment)
    const options: ChartOptions<'bar'> = useChartOptions(colors)

    if (!data) {
        return <MessagesChartSkeleton />
    }

    return (
        <div className={clsx('animate-fade-in relative w-full mb-6 flex justify-end gap-2', className)} {...rest}>
            <div
                className={clsx(
                    'relative overflow-hidden h-0 transition-[height] flex-1 cursor-crosshair',
                    open && 'h-[100px]'
                )}
            >
                <div className="h-[100px]">
                    <Bar ref={chartRef} options={options} data={data} />
                </div>
            </div>
            <Button
                variant="tertiary-neutral"
                size="small"
                onClick={() => setOpen((open) => !open)}
                className="max-h-max"
                title="Toggle chart"
            >
                {open ? <ChevronUpIcon fontSize="18" /> : <ChevronDownIcon fontSize="18" />}
            </Button>
        </div>
    )
}

export const MessagesChartSkeleton = () => {
    return <Skeleton className="relative w-full mb-6 flex justify-end gap-2" height={100} />
}
