'use client'

import React, { useRef, useState } from 'react'
import { Button, Modal, Select, TextField, VStack } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import { addKvittering } from '@/app/actions'
import { FormButton } from '@/components/FormButton'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

type Props = {
    messageValue: string
    messageKey: string
}

export const AddKvitteringButton = ({ messageValue, messageKey }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const [alvorlighetsgrad, setAlvorlighetsgrad] = useState('00')

    const showModal = (e: Event) => {
        e.preventDefault()
        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
    }

    const submitAction = async (formData: FormData) => {
        formData.set('oppdragXml', messageValue)
        formData.set('messageKey', messageKey)

        const response = await addKvittering(formData)
        if (response.error) {
            const message = `Feil ved lagring av kvittering: ${response.error.message}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Lagt til ny kvttering for "${messageKey}"`, {
                variant: 'success',
            })
        }

        closeModal()
        setAlvorlighetsgrad('00')
    }

    return (
        <>
            <ActionMenuItem onSelect={showModal}>Legg til kvittering</ActionMenuItem>
            <Modal ref={ref} header={{ heading: 'Legg til kvittering' }} width={600}>
                <form action={submitAction}>
                    <Modal.Body>
                        <VStack gap="4">
                            <Select
                                name="alvorlighetsgrad"
                                label="Alvorlighetsgrad"
                                onChange={(e) => setAlvorlighetsgrad(e.target.value)}
                            >
                                <option value="00">00 - Ok</option>
                                <option value="04">04 - Akseptert men noe er feil</option>
                            </Select>
                            {alvorlighetsgrad === '04' && (
                                <VStack gap="4">
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
                        <FormButton>Lagre</FormButton>
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}
