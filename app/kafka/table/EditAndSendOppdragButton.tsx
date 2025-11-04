'use client'

import React, { useRef, useState } from 'react'
import { Button, HStack, Modal, Textarea, VStack } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import { addOppdrag } from '@/app/actions'
import { FormButton } from '@/components/FormButton'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { DiffViewer } from '@/components/DiffViewer.tsx'

type Props = {
    messageValue: string
    messageKey: string
}

export const EditAndSendOppdragButton = ({ messageValue, messageKey }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const [editedXml, setEditedXml] = useState(messageValue)
    const [showPreview, setShowPreview] = useState(false)

    const showModal = (e: Event) => {
        e.preventDefault()
        setEditedXml(messageValue)
        setShowPreview(false)
        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
        setShowPreview(false)
    }

    const handleSendInn = (e: React.FormEvent) => {
        e.preventDefault()
        setShowPreview(true)
    }

    const handleGoBack = () => {
        setShowPreview(false)
    }

    const handleConfirm = async () => {
        const formData = new FormData()
        formData.set('oppdragXml', editedXml)
        formData.set('messageKey', messageKey)

        const response = await addOppdrag(formData)
        if (response.error) {
            const message = `Feil ved manuell innsending av oppdrag: ${response.error.message}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Sendt inn oppdrag for "${messageKey}"`, {
                variant: 'success',
            })
        }

        closeModal()
    }

    return (
        <>
            <ActionMenuItem onSelect={showModal}>Rediger og send til oppdrag</ActionMenuItem>
            <Modal
                ref={ref}
                header={{ heading: showPreview ? 'Forhåndsvisning av endringer' : 'Rediger og send oppdrag' }}
                width="1200px"
            >
                <form onSubmit={handleSendInn}>
                    <Modal.Body>
                        {!showPreview ? (
                            <VStack gap="4">
                                <Textarea
                                    label="Oppdrag XML"
                                    description="Rediger XML før innsending"
                                    value={editedXml}
                                    onChange={(e) => setEditedXml(e.target.value)}
                                />
                            </VStack>
                        ) : (
                            <DiffViewer original={messageValue} edited={editedXml} />
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        {!showPreview ? (
                            <>
                                <FormButton>Send inn</FormButton>
                                <Button type="button" variant="secondary" onClick={closeModal}>
                                    Avbryt
                                </Button>
                            </>
                        ) : (
                            <HStack gap="4">
                                <Button type="button" variant="primary" onClick={handleConfirm}>
                                    Godkjenn endringer
                                </Button>
                                <Button type="button" variant="secondary" onClick={handleGoBack}>
                                    Tilbake
                                </Button>
                                <Button type="button" variant="tertiary" onClick={closeModal}>
                                    Avbryt
                                </Button>
                            </HStack>
                        )}
                    </Modal.Footer>
                </form>
            </Modal>
        </>
    )
}