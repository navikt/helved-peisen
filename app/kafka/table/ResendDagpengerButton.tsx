import React from 'react'
import { logger } from '@navikt/next-logger'

import { resendDagpenger } from '@/app/actions'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

type Props = {
    messageValue: string
    messageKey: string
}

export const ResendDagpengerButton = ({ messageValue, messageKey }: Props) => {
    const handleMenuItemClick = async (e: Event) => {
        e.preventDefault()

        const formData = new FormData()
        formData.set('key', messageKey)
        formData.set('value', messageValue)

        const response = await resendDagpenger(formData)
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
        <ActionMenuItem onSelect={handleMenuItemClick}>
            Bygg og send oppdrag på nytt
        </ActionMenuItem>
    )
}