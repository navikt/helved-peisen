import { useState } from 'react'
import { logger } from '@navikt/next-logger'
import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

import { showToast } from '@/components/Toast.tsx'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { tombstoneUtbetaling } from '@/app/kafka/table/actionMenu/actions'

type Props = {
    messageKey: string
}

export const TombstoneUtbetalingButton = ({ messageKey }: Props) => {
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

        const response = await tombstoneUtbetaling(formData)

        setIsLoading(false)

        if (response.error) {
            const message = `Feil ved tombstoning av utbetaling: ${response.error}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Tombstonet utbetaling for key "${messageKey}"`, {
                variant: 'success',
            })
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>Tombstone utbetaling</ActionMenuItem>
            <ConfirmationModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirm}
                heading="Tombstone utbetaling"
                body={`Er du sikker på at du vil tombstone utbetaling for key: ${messageKey}?`}
                confirmText="Ja, tombstone"
                isLoading={isLoading}
            />
        </>
    )
}
