import React, { startTransition, useRef, useState } from 'react'
import clsx from 'clsx'
import { DatePickerStandalone } from '@navikt/ds-react/DatePicker'
import { Button, HStack, Modal, TextField, VStack } from '@navikt/ds-react'
import { ModalBody } from '@navikt/ds-react/Modal'
import { CalendarIcon } from '@navikt/aksel-icons'

import { useElementHeight } from '@/hooks/useElementHeight.ts'

import styles from './UrlSearchParamDateTimePicker.module.css'

const validDate = (date: Date | string): boolean => {
    return !isNaN(new Date(date).valueOf())
}

const times = new Array(24)
    .fill(0)
    .map((it, i) => it + i)
    .flatMap((it) => [`${it}:00`, `${it}:30`])

const isSameTime = (date: string, time: string) => {
    const parsed = new Date(date)
    const [hours, minutes] = time.split(':').map((it) => +it)
    return parsed.getHours() === hours && parsed.getMinutes() === minutes
}

const isKeyboardEvent = (
    event: React.SyntheticEvent
): event is React.KeyboardEvent => {
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

    const [textFieldValue, setTextFieldValue] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const onChangeTextFieldValue = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setError(null)
        setTextFieldValue(event.target.value)
    }

    const onSubmitDateTime = (event: React.SyntheticEvent) => {
        if (isKeyboardEvent(event) && event.key !== 'Enter') {
            return
        }

        const value = textFieldValue
        if (value && validDate(value)) {
            startTransition(() => {
                onUpdateValue(value)
                setTextFieldValue(null)
            })
        } else {
            setError('Ugyldig tidspunkt')
        }
    }

    const onSelectDate = (date?: Date) => {
        if (date) {
            onUpdateValue(date.toISOString())
        }
    }

    const onSelectTime = (time: string) => {
        const date = new Date(value)
        const [hours, minutes] = time.split(':').map((it) => +it)
        date.setHours(hours)
        date.setMinutes(minutes)
        onUpdateValue(date.toISOString())
    }

    const onStartEditingTextField = () => {
        if (!textFieldValue) {
            setTextFieldValue(value)
        }
    }

    return (
        <>
            <HStack className={styles.textFieldContainer} gap="space-16">
                <TextField
                    label={label}
                    className={styles.textField}
                    value={textFieldValue ?? value}
                    onFocus={onStartEditingTextField}
                    onChange={onChangeTextFieldValue}
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
                            value={textFieldValue ?? value}
                            onFocus={onStartEditingTextField}
                            onChange={onChangeTextFieldValue}
                            onKeyDown={onSubmitDateTime}
                            onBlur={onSubmitDateTime}
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
                                selected={new Date(value)}
                                onSelect={onSelectDate}
                            />
                            <VStack className={styles.timeList}>
                                {times.map((it) => (
                                    <Button
                                        key={it}
                                        variant="tertiary"
                                        size="small"
                                        onClick={() => onSelectTime(it)}
                                        className={clsx(
                                            isSameTime(value, it) &&
                                                styles.active
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
