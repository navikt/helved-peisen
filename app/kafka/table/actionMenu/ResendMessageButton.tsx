import { useState } from 'react'
import { logger } from '@navikt/next-logger'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { Button, Modal, Textarea } from '@navikt/ds-react'

import { showToast } from '@/components/Toast.tsx'
import { resendMessage } from '@/lib/io'
import type { Message } from '@/app/kafka/types.ts'

type Props = {
    message: Message
    label: string
}

export const ResendMessageButton = ({ message, label }: Props) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [reason, setReason] = useState('')

    const [validationError, setValidationError] = useState(false)

    const resend = async () => {
        setIsLoading(true)

        if (!reason || reason.length === 0) {
            setValidationError(true)
            setIsLoading(false)
            return
        } else {
            setValidationError(false)
        }

        try {
            await resendMessage(message, reason)
            showToast(`Resendte melding med nøkkel ${message.key} på nytt`, {
                variant: 'success',
            })
        } catch (e) {
            logger.error(e)
            showToast(`Klarte ikke resende melding ${message.key}`, { variant: 'error' })
        } finally {
            setIsLoading(false)
            setOpen(false)
        }
    }

    const openModal = (e: Event) => {
        e.preventDefault()
        setOpen(true)
    }

    const closeModal = () => {
        setOpen(false)
        setValidationError(false)
        setReason('')
        setIsLoading(false)
    }

    return (
        <>
            <ActionMenuItem onSelect={openModal}>{label}</ActionMenuItem>
            <Modal
                open={open}
                onClose={closeModal}
                header={{
                    heading: label,
                    size: 'small',
                }}
            >
                <Modal.Body>
                    <Textarea
                        label="Oppgi grunn"
                        description="Grunnen du oppgir vil være synlig i audit-loggen"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        error={validationError && (!reason || reason.length === 0) ? 'Grunn må oppgis' : null}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button type="button" onClick={resend} loading={isLoading}>
                        Send på nytt
                    </Button>
                    <Button type="button" variant="secondary" onClick={closeModal} disabled={isLoading}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
