import React, { useState } from 'react'
import { logger } from '@navikt/next-logger'
import { resendDagpenger } from '@/app/actions'
import { showToast } from '@/components/Toast.tsx'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { ConfirmationModal } from '@/components/ConfirmationModal.tsx'

type Props = {
    messageValue: string
    messageKey: string
}

export const ResendDagpengerButton = ({ messageValue, messageKey }: Props) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleMenuItemClick = (e: Event) => {
        e.preventDefault()
        setModalOpen(true)
    }

    const handleConfirm = async () => {
        setIsLoading(true)

        const formData = new FormData()
        formData.set('key', messageKey)
        formData.set('value', messageValue)

        const response = await resendDagpenger(formData)

        setIsLoading(false)

        if (response.error) {
            const message = `Feil ved bygg og send oppdrag på nytt: ${response.error.message}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Bygget og sendt oppdrag på nytt for key "${messageKey}"`, {
                variant: 'success',
            })
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>
                Bygg og send oppdrag på nytt
            </ActionMenuItem>

            <ConfirmationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                heading="Bygg og send oppdrag på nytt"
                body={`Er du sikker på at du vil bygge og sende oppdrag på nytt for key: ${messageKey}?`}
                confirmText="Ja, send på nytt"
                isLoading={isLoading}
            />
        </>
    )
}