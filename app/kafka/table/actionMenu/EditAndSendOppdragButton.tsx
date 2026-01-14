'use client'

import React, { useRef, useState } from 'react'
import { Button, Modal, Textarea } from '@navikt/ds-react'
import { FormButton } from '@/components/FormButton.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { DiffViewer } from '@/components/DiffViewer.tsx'
import { showToast } from '@/components/Toast.tsx'
import { addOppdrag } from '@/app/actions.ts'
import { logger } from '@navikt/next-logger'

function olderThanAnHour(ms: number): boolean {
    return Date.now() - ms > 60 * 60 * 1000
}

type Props = {
    xml: string
    messageKey: string
    system_time_ms: number
}

export const EditAndSendOppdragButton = ({ xml, messageKey, system_time_ms }: Props) => {
    const ref = useRef<HTMLDialogElement>(null)
    const [editedXml, setEditedXml] = useState(xml)
    const [showPreview, setShowPreview] = useState(false)

    const showModal = (e: Event) => {
        e.preventDefault()

        if (!olderThanAnHour(system_time_ms)) {
            showToast('Kan ikke sende inn oppdrag på nytt før det har gått en time', { variant: 'warning' })
            return
        }

        setEditedXml(xml)
        setShowPreview(false)
        ref.current?.showModal()
    }

    const closeModal = () => {
        ref.current?.close()
        setShowPreview(false)
        setEditedXml(xml)
    }

    const sendTilOppdrag = async () => {
        const formData = new FormData()
        formData.set('value', editedXml)
        formData.set('key', messageKey)

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
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (showPreview || editedXml === xml) {
            sendTilOppdrag()
            closeModal()
        } else {
            setShowPreview(true)
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={showModal}>Send til oppdrag</ActionMenuItem>
            <Modal ref={ref} header={{ heading: 'Send inn oppdrag' }} className="w-[150ch] max-w-[90vw] relative">
                <form onSubmit={onSubmit}>
                    {showPreview ? (
                        <>
                            <Modal.Body>
                                <DiffViewer original={xml} edited={editedXml} />
                            </Modal.Body>
                            <Modal.Footer>
                                <FormButton>Godkjenn endringer</FormButton>
                                <Button type="button" variant="secondary" onClick={() => setShowPreview(false)}>
                                    Tilbake
                                </Button>
                                <Button type="button" variant="tertiary" onClick={closeModal}>
                                    Avbryt
                                </Button>
                            </Modal.Footer>
                        </>
                    ) : (
                        <>
                            <Modal.Body>
                                <Textarea
                                    className="[&_textarea]:h-[70vh] [&_textarea]:overflow-auto!"
                                    label="Oppdrag-XML"
                                    description="Innholdet kan redigeres før innsending eller sendes inn som den er."
                                    value={editedXml}
                                    onChange={(e) => setEditedXml(e.target.value)}
                                />
                            </Modal.Body>
                            <Modal.Footer>
                                <FormButton>
                                    {xml === editedXml ? 'Send inn uten endringer' : 'Se gjennom endringer'}
                                </FormButton>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setEditedXml(xml)}
                                    disabled={xml === editedXml}
                                >
                                    Nullstill endringer
                                </Button>
                                <Button type="button" variant="tertiary" onClick={closeModal}>
                                    Avbryt
                                </Button>
                            </Modal.Footer>
                        </>
                    )}
                </form>
            </Modal>
        </>
    )
}
