import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { DatePickerStandalone } from '@navikt/ds-react/DatePicker'
import { Button, HStack, Modal, TextField, VStack } from '@navikt/ds-react'
import { ModalBody } from '@navikt/ds-react/Modal'
import { CalendarIcon } from '@navikt/aksel-icons'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'

import { useElementHeight } from '@/hooks/useElementHeight.ts'

import styles from './UrlSearchParamDateTimePicker.module.css'

const FORMAT_STRING = 'dd.MM.yyyy, HH:mm'

const formatDate = (date: Date): string => {
    return format(date, FORMAT_STRING)
}

const parseDate = (date: string): Date => {
    return parse(date, FORMAT_STRING, new Date())
}

const validDate = (date: string): boolean => {
    return !isNaN(parseDate(date).valueOf())
}

const getTime = (date: Date): string => {
    return `${date.getHours()}:${date.getMinutes()}`
}

const times = new Array(24)
    .fill(0)
    .map((it, i) => it + i)
    .flatMap((it) => [`${it}:00`, `${it}:30`])

const isKeyboardEvent = (
    event: React.SyntheticEvent
): event is React.KeyboardEvent<HTMLInputElement> => {
    return event.type === 'keydown'
}

type Props = {
    label: string
    value: string
    onUpdateValue: (value: string) => void
}

export const UrlSearchParamDateTimePicker: React.FC<Props> = ({
    label,
    value,
    onUpdateValue,
}) => {
    const modalRef = useRef<HTMLDialogElement>(null)
    const [datePickerRef, datePickerHeight] = useElementHeight()

    const parsedValue = new Date(value)

    const [date, setDate] = useState<Date>(parsedValue)
    const [time, setTime] = useState<string>(getTime(parsedValue))
    const [dateTime, setDateTime] = useState<string>(formatDate(parsedValue))

    useLayoutEffect(() => {
        // Opddater `dateTime` med verdiene til `date` og `time` etterhvert som de endres
        try {
            if (date) {
                const newDate = new Date(date)
                const [hours, minutes] = time.split(':').map((it) => +it)
                newDate.setHours(hours)
                newDate.setMinutes(minutes)

                setDateTime(formatDate(newDate))
            }
        } catch (_) {
            // Bruker har skrevet inn ugyldig tidspunkt. Error vises bruker og vi trenger ikke gjøre noe mer her
        }
    }, [date, time])

    const onSelectDate = (selected?: Date) => {
        setDate(selected ?? new Date())
    }

    const onChangeDateTime = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target?.value) {
            setDateTime(event.target.value)
        }
    }

    const onSubmitDateTime = (event: React.SyntheticEvent) => {
        if (isKeyboardEvent(event) && event.key !== 'Enter') {
            return
        }

        const dt = parseDate(dateTime)
        const hours = dt.getHours()
        const minutes = dt.getMinutes()

        setDate(dt)
        setTime(`${hours}:${minutes}`)
    }

    useEffect(() => {
        const parsedValue = parseDate(formatDate(new Date(value)))
        const areEqual = parsedValue.getTime() === parseDate(dateTime).getTime()
        if (!areEqual && validDate(dateTime)) {
            onUpdateValue(parseDate(dateTime).toISOString())
        }
    }, [value, dateTime, onUpdateValue])

    const error = date && validDate(dateTime) ? null : 'Ugyldig tidspunkt'

    return (
        <>
            <HStack className={styles.textFieldContainer} gap="space-16">
                <TextField
                    label={label}
                    className={styles.textField}
                    value={dateTime}
                    onChange={onChangeDateTime}
                    onKeyDown={onSubmitDateTime}
                    onBlur={onSubmitDateTime}
                    error={error}
                />
                <Button
                    className={styles.textFieldButton}
                    variant="tertiary"
                    onClick={() => modalRef.current?.showModal()}
                >
                    <CalendarIcon fontSize={24} />
                </Button>
            </HStack>
            <Modal
                ref={modalRef}
                header={{ heading: 'Velg tidspunkt' }}
                closeOnBackdropClick
            >
                <ModalBody>
                    <VStack className={styles.container}>
                        <TextField
                            className={styles.dateTimeTextField}
                            hideLabel
                            label="Valgt tidspunkt"
                            value={dateTime}
                            onChange={onChangeDateTime}
                            error={error}
                        />
                        <HStack
                            style={{
                                '--timelist-height': datePickerHeight,
                            }}
                            className={styles.pickerContainer}
                        >
                            <DatePickerStandalone
                                ref={datePickerRef}
                                className={styles.datePicker}
                                selected={date}
                                onSelect={onSelectDate}
                            />
                            <VStack className={styles.timeList}>
                                {times.map((it) => (
                                    <Button
                                        key={it}
                                        variant="tertiary"
                                        size="small"
                                        onClick={() => setTime(it)}
                                        className={clsx(
                                            it === time && styles.active
                                        )}
                                    >
                                        {it}
                                    </Button>
                                ))}
                            </VStack>
                        </HStack>
                    </VStack>
                </ModalBody>
            </Modal>
        </>
    )
}
