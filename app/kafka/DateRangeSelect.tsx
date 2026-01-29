import React, { FC, useEffect, useState } from 'react'
import clsx from 'clsx'
import { format } from 'date-fns/format'
import { formatDistanceStrict } from 'date-fns/formatDistanceStrict'
import { intlFormatDistance } from 'date-fns/intlFormatDistance'
import { parse } from 'date-fns/parse'
import { sub } from 'date-fns/sub'
import { differenceInSeconds } from 'date-fns'
import { subDays } from 'date-fns/subDays'
import { BodyShort, Button, Dropdown, HStack, Select, Tabs, TextField, VStack } from '@navikt/ds-react'
import { DropdownMenu } from '@navikt/ds-react/Dropdown'
import { TabsList, TabsPanel, TabsTab } from '@navikt/ds-react/Tabs'
import { ArrowRightIcon, CalendarIcon } from '@navikt/aksel-icons'
import { DatePickerStandalone } from '@navikt/ds-react/DatePicker'

import { CompactTextField } from '@/components/CompactTextField.tsx'
import { useElementHeight } from '@/hooks/useElementHeight.ts'
import { parseDateValue } from '@/lib/date.ts'

const times = new Array(24)
    .fill(0)
    .map((it, i) => it + i)
    .flatMap((it) => [`${it}:00`, `${it}:30`])

const capitalize = (value: string) => {
    return value.length > 1 ? value[0].toUpperCase() + value.slice(1) : value.toUpperCase()
}

const parseDate = (localized: string): Date => {
    return parse(localized, 'dd.MM.yyyy, HH:mm:ss', new Date())
}

type AbsoluteTimeSelectProps = {
    time: Date
    onSelectTime: (date: Date) => void
}

const AbsoluteTimeSelect: React.FC<AbsoluteTimeSelectProps> = ({ time, onSelectTime }) => {
    const [datePickerRef, datePickerHeight] = useElementHeight()

    const [hours, setHours] = useState(format(time, 'HH:mm'))
    const [date, setDate] = useState(time)
    const [value, setValue] = useState(time.toLocaleString('nb-NO'))
    const [error, setError] = useState<string | null>()

    const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseDate(event.target.value)
        setValue(event.target.value)
        if (isNaN(time.getTime())) {
            setError('Ugyldig tidspunkt')
            return
        }

        setError(null)
        setDate(time)
        setHours(format(time, 'HH:mm'))
    }

    const onSelectDate = (date?: Date) => {
        if (date) {
            setDate(date)
            setValue(date.toLocaleString('nb-NO'))
            setError(null)
        }
    }

    const onSelectHours = (time: string) => {
        setHours(time)
        const [hours, minutes] = time.split(':').map((it) => +it)

        const newValue = parseDate(value)
        if (isNaN(newValue.getTime())) {
            return
        }

        newValue.setHours(hours)
        newValue.setMinutes(minutes)
        newValue.setSeconds(0)
        setValue(newValue.toLocaleString('nb-NO'))
    }

    const onClickUpdate = () => {
        const date = parseDate(value)
        if (isNaN(date.getTime())) {
            setError('Ugyldig tidspunkt')
            return
        }

        setError(null)
        onSelectTime(date)
    }

    return (
        <>
            <CompactTextField
                containerClass="mt-4"
                label="Valgt tidspunkt"
                value={value}
                onChange={onChangeValue}
                error={error}
            />
            <HStack
                style={{ '--timelist-height': datePickerHeight }}
                className="relative justify-between gap-5 flex-nowrap"
            >
                <DatePickerStandalone
                    ref={datePickerRef}
                    className="[&>div]:p-0"
                    selected={date}
                    onSelect={onSelectDate}
                />
                <VStack className="h-(--timelist-height) overflow-y-auto gap-1">
                    {times.map((it) => (
                        <Button
                            key={it}
                            variant="tertiary"
                            size="small"
                            onClick={() => onSelectHours(it)}
                            className={clsx(
                                hours === it && 'text-(--ax-text-accent-contrast) bg-(--ax-bg-accent-strong-pressed)'
                            )}
                        >
                            {it}
                        </Button>
                    ))}
                </VStack>
            </HStack>
            <Button onClick={onClickUpdate} size="small">
                Oppdater
            </Button>
        </>
    )
}

type RelativeTimeSelectProps = {
    time?: Date
    onSelectTime: (date: Date) => void
}

const RelativeTimeSelect: React.FC<RelativeTimeSelectProps> = ({ time, onSelectTime }) => {
    const [defaultDuration, defaultUnit] = (
        time ? formatDistanceStrict(time, new Date()) : formatDistanceStrict(subDays(new Date(), 30), new Date())
    ).split(' ')

    const [duration, setDuration] = useState(+defaultDuration)
    const [unit, setUnit] = useState(defaultUnit[defaultUnit.length - 1] === 's' ? defaultUnit : defaultUnit + 's')

    const [value, setValue] = useState(sub(new Date(), { [unit]: duration }).toLocaleString('nb-NO'))
    const [error, setError] = useState<string | null>()

    const onChangeDuration = (event: React.ChangeEvent<HTMLInputElement>) => {
        const duration = +event.target.value
        setDuration(duration)
        setValue(sub(new Date(), { [unit]: duration }).toLocaleString('nb-NO'))
        setError(null)
    }

    const onChangeUnit = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const unit = event.target.value
        setUnit(unit)
        setValue(sub(new Date(), { [unit]: duration }).toLocaleString('nb-NO'))
        setError(null)
    }

    const onChangeValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseDate(event.target.value)
        setValue(event.target.value)
        if (isNaN(time.getTime())) {
            setError('Ugyldig tidspunkt')
            return
        }

        const [duration, unit] = formatDistanceStrict(time, new Date()).split(' ')
        setError(null)
        setUnit(unit)
        setDuration(+duration)
    }

    const onClickUpdate = () => {
        const time = parseDate(value)
        if (isNaN(time.getTime())) {
            setError('Ugyldig tidspunkt')
            return
        }

        setError(null)
        onSelectTime(time)
    }

    return (
        <>
            <div className="flex gap-2 w-full mt-4">
                <TextField className="w-full" label="" value={duration} onChange={onChangeDuration} size="small" />
                <Select className="w-full" label="" size="small" value={unit} onChange={onChangeUnit}>
                    <option value="minutes">Minutter siden</option>
                    <option value="hours">Timer siden</option>
                    <option value="days">Dager siden</option>
                    <option value="weeks">Uker siden</option>
                    <option value="months">Måneder siden</option>
                    <option value="years">År siden</option>
                </Select>
            </div>
            <CompactTextField
                label="Startdato"
                value={value}
                onChange={onChangeValue}
                containerClass="w-full"
                error={error}
            />
            <Button onClick={onClickUpdate} size="small">
                Oppdater
            </Button>
        </>
    )
}

type NowTimeSelectProps = {
    onSelectTime: () => void
}

const NowTimeSelect: React.FC<NowTimeSelectProps> = ({ onSelectTime }) => {
    const setToNow = () => {
        onSelectTime()
    }

    return (
        <>
            <BodyShort className="mt-4">
                Å sette tiden til &quot;Nå&quot; betyr at tiden vil oppdatere seg ved hver refresh til å være tiden
                refreshen ble foretatt.
            </BodyShort>
            <Button size="small" onClick={setToNow}>
                Sett tiden til &quot;Nå&quot;
            </Button>
        </>
    )
}

const formatTimeLabelForMode = (time: Date, mode: 'absolute' | 'relative' | 'now') => {
    switch (mode) {
        case 'absolute':
            return time.toLocaleString()
        case 'relative':
            return intlFormatDistance(time, new Date(), {
                locale: 'nb-NO',
            })
        default:
            return time.toISOString()
    }
}

type DateSelectDropdownProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    time: Date
    onSelectTime: (date: string) => void
}

const DateSelectDropdown: React.FC<DateSelectDropdownProps> = ({ time, onSelectTime, ...rest }) => {
    const [mode, setMode] = useState<'absolute' | 'relative'>('relative')
    const [label, setLabel] = useState(formatTimeLabelForMode(time, mode))

    useEffect(() => {
        if (differenceInSeconds(new Date(), time) < 30) {
            setLabel('Nå')
        } else {
            setLabel(formatTimeLabelForMode(time, mode))
        }
    }, [time, mode])

    const onSetAbsoluteTime = (date: Date) => {
        setMode('absolute')
        onSelectTime(date.toISOString())
    }

    const onSetRelativeTime = (date: Date) => {
        setMode('relative')
        onSelectTime(date.toISOString())
    }

    const onSetNowTime = () => {
        onSelectTime('now')
    }

    return (
        <Dropdown>
            <Button as={Dropdown.Toggle} {...rest}>
                {capitalize(label)}
            </Button>
            <DropdownMenu placement="bottom" className="w-125">
                <Tabs defaultValue={label === 'Nå' ? 'now' : 'relative'} size="small" fill>
                    <TabsList>
                        <TabsTab value="absolute" label="Absolutt" data-testid="date-range-absolute-tab" />
                        <TabsTab value="relative" label="Relativ" data-testid="date-range-relative-tab" />
                        <TabsTab value="now" label="Nå" data-testid="date-range-now-tab" />
                    </TabsList>
                    <TabsPanel className="flex flex-col gap-4" value="absolute">
                        <AbsoluteTimeSelect time={time} onSelectTime={onSetAbsoluteTime} />
                    </TabsPanel>
                    <TabsPanel className="flex flex-col gap-4" value="relative">
                        <RelativeTimeSelect time={time} onSelectTime={onSetRelativeTime} />
                    </TabsPanel>
                    <TabsPanel className="flex flex-col gap-4" value="now">
                        <NowTimeSelect onSelectTime={onSetNowTime} />
                    </TabsPanel>
                </Tabs>
            </DropdownMenu>
        </Dropdown>
    )
}

type Props = {
    from: string
    to: string
    updateFrom: (from: string) => void
    updateTo: (to: string) => void
}

export const DateRangeSelect: FC<Props> = ({ from, to, updateFrom, updateTo }) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="text-base/(--ax-font-line-height-medium) font-semibold">Tidsrom</div>
            <HStack
                className="relative max-w-max h-8 flex items-center gap-0 bg-(--ax-bg-input) rounded-lg border border-(--ax-border-neutral) hover:border-(--ax-border-accent)"
                gap="space-16"
            >
                <DateSelectDropdown
                    data-testid="date-range-fom"
                    time={new Date(from)}
                    onSelectTime={updateFrom}
                    className="border-none bg-transparent text-inherit h-full py-0 px-3"
                />
                <ArrowRightIcon />
                <DateSelectDropdown
                    data-testid="date-range-tom"
                    time={new Date(parseDateValue(to))}
                    onSelectTime={updateTo}
                    className="border-none bg-transparent text-inherit h-full py-0 px-3"
                />
                <div className="h-full py-0 px-2 flex items-center rounded-l-none">
                    <CalendarIcon fontSize={24} />
                </div>
            </HStack>
        </div>
    )
}
