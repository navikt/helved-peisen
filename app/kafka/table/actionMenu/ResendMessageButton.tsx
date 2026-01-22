import { useState } from 'react'
import { logger } from '@navikt/next-logger'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

import { showToast } from '@/components/Toast.tsx'
import { ConfirmationModal } from '@/components/ConfirmationModal.tsx'
import { resendMessage } from '@/lib/io'
import type { Message } from '@/app/kafka/types.ts'

type Props = {
    message: Message
    label: string
}

export const ResendMessageButton = ({ message, label }: Props) => {
    const [modalOpen, setModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleMenuItemClick = (e: Event) => {
        e.preventDefault()
        setModalOpen(true)
    }

    const handleConfirm = async () => {
        setIsLoading(true)

        try {
            await resendMessage(message)
            showToast(`Resendte melding med nøkkel ${message.key} på nytt`, {
                variant: 'success',
            })
        } catch (e) {
            logger.error(e)
            showToast(`Klarte ikke resende melding ${message.key}`, { variant: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>{label}</ActionMenuItem>
            <ConfirmationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                heading={label}
                body={`Er du sikker på at du vil sende melding på nytt ${message.key}?`}
                confirmText="Ja, send på nytt"
                isLoading={isLoading}
            />
        </>
    )
}
