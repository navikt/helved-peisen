'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { BodyShort, Button, Modal, Textarea, VStack } from '@navikt/ds-react'

import { endreUtbetaling } from '@/app/kafka/table/actionMenu/actions.ts'
import { fetchRawMessage } from '@/app/kafka/actions.ts'
import { isSuccessResponse } from '@/lib/api/types.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import { DiffView } from '@/components/DiffView.tsx'
import type { Message } from '@/app/kafka/types.ts'

type Props = {
    message: Message
    disabled?: boolean
}

type Step = 'edit' | 'confirm'

export const EndreUtbetalingButton = ({ message, disabled }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const endreUtbetalingWithKey = endreUtbetaling.bind(null, message.key)
    const [state, formAction, pending] = useActionState(endreUtbetalingWithKey, { status: 'initial' })
    const [originalValue, setOriginalValue] = useState('')
    const [value, setValue] = useState('')
    const [reason, setReason] = useState('')
    const [step, setStep] = useState<Step>('edit')
    const [clientError, setClientError] = useState<string>()

    const openModal = async (e: Event) => {
        e.preventDefault()
        if (disabled) return

        setStep('edit')
        setClientError(undefined)
        setReason('')

        const res = await fetchRawMessage(message)
        if (isSuccessResponse(res) && res.data.value) {
            let formatted = res.data.value
            try {
                formatted = JSON.stringify(JSON.parse(res.data.value), null, 2)
            } catch {
                // fall back to raw value if it isn't valid JSON
            }
            setOriginalValue(formatted)
            setValue(formatted)
        }

        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
    }

    const goToConfirm = () => {
        if (value.trim().length === 0) {
            setClientError('Value er påkrevd')
            return
        }
        if (reason.trim().length === 0) {
            setClientError('Grunn må oppgis')
            return
        }
        setClientError(undefined)
        setStep('confirm')
    }

    useEffect(() => {
        if (state.status === 'success') {
            showToast(`Endret utbetaling ${message.key}`, { variant: 'success' })
            ref.current?.close()
        }
        if (state.status === 'error') {
            showToast(state.message ?? 'Klarte ikke endre utbetaling', { variant: 'error' })
        }
        if (state.status === 'invalid') {
            setStep('edit')
        }
    }, [state, message.key])

    return (
        <>
            <ActionMenuItem onSelect={openModal} disabled={disabled}>
                Endre utbetaling
            </ActionMenuItem>
            <Modal
                ref={ref}
                header={{
                    heading: step === 'edit' ? 'Endre utbetaling' : 'Bekreft endring',
                    size: 'small',
                }}
                width={step === 'edit' ? 700 : 1000}
            >
                <form action={formAction}>
                    <input type="hidden" name="value" value={value} />
                    <input type="hidden" name="reason" value={reason} />
                    <Modal.Body>
                        {step === 'edit' && (
                            <VStack gap="space-16">
                                <Textarea
                                    label="Verdi (JSON)"
                                    description="Innholdet erstatter utbetalingens nåværende verdi"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    error={
                                        state?.validation?.value ??
                                        (clientError === 'Value er påkrevd' ? clientError : undefined)
                                    }
                                    minRows={12}
                                    maxRows={20}
                                />
                                <Textarea
                                    label="Oppgi grunn"
                                    description="Grunnen du oppgir vil være synlig i audit-loggen"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    error={
                                        state?.validation?.reason ??
                                        (clientError === 'Grunn må oppgis' ? clientError : undefined)
                                    }
                                />
                            </VStack>
                        )}
                        {step === 'confirm' && (
                            <VStack gap="space-16">
                                <BodyShort weight="semibold">
                                    Er du sikker på at du vil gjøre denne endringen?
                                </BodyShort>
                                <DiffView original={originalValue} updated={value} className="max-h-125" />
                            </VStack>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {step === 'edit' && (
                            <>
                                <Button type="button" onClick={goToConfirm} disabled={pending}>
                                    Endre utbetaling
                                </Button>
                                <Button type="button" variant="secondary" onClick={closeModal} disabled={pending}>
                                    Avbryt
                                </Button>
                            </>
                        )}
                        {step === 'confirm' && (
                            <>
                                <Button type="submit" loading={pending} disabled={pending}>
                                    Ja
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setStep('edit')}
                                    disabled={pending}
                                >
                                    Avbryt
                                </Button>
                            </>
                        )}
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}
