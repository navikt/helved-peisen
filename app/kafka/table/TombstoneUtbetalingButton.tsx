import React from 'react'
import { logger } from '@navikt/next-logger'

import { tombstoneUtbetaling } from '@/app/actions'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

type Props = {
    messageKey: string
}

export const TombstoneUtbetalingButton = ({ messageKey }: Props) => {
    const handleMenuItemClick = async (e: Event) => {
        e.preventDefault()

        const formData = new FormData()
        formData.set('key', messageKey)

        const response = await tombstoneUtbetaling(formData)
        if (response.error) {
            const message = `Feil ved tombstoning av utbetaling: ${response.error.message}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Tombstonet utbetaling for key "${messageKey}"`, {
                variant: 'success',
            })
        }
    }

    return (
        <ActionMenuItem onSelect={handleMenuItemClick}>
            Tombstone utbetaling
        </ActionMenuItem>
    )
}