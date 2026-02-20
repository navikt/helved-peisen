'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Button, Modal, Select, Textarea, TextField, VStack } from '@navikt/ds-react'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { addKvittering } from './actions'
import type { Message } from '@/app/kafka/types.ts'
import { showToast } from '@/components/Toast'

type Props = {
    message: Message
}

export const AddKvitteringButton = ({ message }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const addKvitteringWithMessageData = addKvittering.bind(null, {
        partition: message.partition,
        offset: message.offset,
        key: message.key,
    })
    const [state, formAction, pending] = useActionState(addKvitteringWithMessageData, { status: 'initial' })
    const [alvorlighetsgrad, setAlvorlighetsgrad] = useState('00')

    const openModal = (e: Event) => {
        e.preventDefault()
        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
    }

    useEffect(() => {
        if (state.status === 'success') {
            showToast(`Lagt til ny kvittering for ${message.key}`, { variant: 'success' })
            ref.current?.close()
        }
        if (state.status === 'error') {
            showToast(state.message ?? 'Klarte ikke legge til kvittering', { variant: 'error' })
            ref.current?.close()
        }
    }, [state, message.key])
    return (
        <>
            <ActionMenuItem onSelect={openModal}>Legg til kvittering</ActionMenuItem>
            <Modal ref={ref} header={{ heading: 'Legg til kvittering' }} width={600}>
                <form action={formAction}>
                    <Modal.Body>
                        <VStack gap="space-16">
                            <Textarea
                                name="reason"
                                label="Oppgi grunn"
                                description="Grunnen du oppgir vil være synlig i audit-loggen"
                                error={state?.validation?.reason}
                            />
                            <Select
                                name="alvorlighetsgrad"
                                onChange={(e) => setAlvorlighetsgrad(e.target.value)}
                                label="Alvorlighetsgrad"
                            >
                                <option value="00">00 - Ok</option>
                                <option value="04">04 - Akseptert men noe er feil</option>
                            </Select>
                            {alvorlighetsgrad === '04' && (
                                <VStack gap="space-16">
                                    <TextField
                                        name="beskrMelding"
                                        label="Beskrivelse"
                                        description="Angi beskrivelse for kvitteringen"
                                    />
                                    <TextField
                                        name="kodeMelding"
                                        label="Kode"
                                        description="Angi kode for kvitteringen"
                                    />
                                </VStack>
                            )}
                        </VStack>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" loading={pending} disabled={pending}>
                            Lagre
                        </Button>
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={pending}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}
