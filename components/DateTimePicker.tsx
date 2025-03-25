'use client'

import clsx from 'clsx'
import React, { useLayoutEffect, useRef, useState } from 'react'
import { DatePickerStandalone } from '@navikt/ds-react/DatePicker'
import { Button, HStack, Modal, TextField, VStack } from '@navikt/ds-react'
import { ModalBody, ModalFooter } from '@navikt/ds-react/Modal'
import { CalendarIcon } from '@navikt/aksel-icons'

import { useElementHeight } from '@/hooks/useElementHeight.ts'

import styles from './DateTimePicker.module.css'

const times = new Array(24)
    .fill(0)
    .map((it, i) => it + i)
    .flatMap((it) => [`${it}:00`, `${it}:30`])

type Props = {
    label: string
}

export const DateTimePicker: React.FC<Props> = ({ label }) => {
    const modalRef = useRef<HTMLDialogElement>(null)
    const [datePickerRef, datePickerHeight] = useElementHeight()

    const [date, setDate] = useState<Date>(new Date())
    const [time, setTime] = useState<string>(times[0])

    const [dateTime, setDateTime] = useState<string>('')
    const [error, setError] = useState<string | null>()

    useLayoutEffect(() => {
        const newDate = new Date(date)
        const [hours, minutes] = time.split(':').map((it) => +it)
        newDate.setHours(hours)
        newDate.setMinutes(minutes)

        setDateTime(newDate.toISOString())
    }, [date, time])

    const onSelectDate = (selected?: Date) => {
        setDate(selected ?? new Date())
    }

    const onChangeDateTime = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target?.value) {
            setDateTime(event.target.value)
        }

        const dateTime = new Date(event.target.value)

        if (isNaN(dateTime.valueOf())) {
            setError('Ugyldig tidspunkt')
            return
        }

        const hours = dateTime.getHours()
        const minutes = dateTime.getMinutes()

        setDate(dateTime)
        setTime(`${hours}:${minutes}`)
        setError(null)
    }

    return (
        <>
            <HStack className={styles.textFieldContainer} gap="space-16">
                <TextField
                    label={label}
                    className={styles.textField}
                    value={dateTime}
                    onChange={onChangeDateTime}
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
                <ModalFooter>
                    <Button>Velg angitt tidspunkt</Button>
                    <Button
                        onClick={() => modalRef.current?.close()}
                        variant="secondary"
                    >
                        Avbryt
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    )
}
