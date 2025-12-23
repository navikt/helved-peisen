import React from 'react'
import { logger } from '@navikt/next-logger'

import { addOppdrag } from '@/app/actions.ts'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

type Props = {
    messageValue: string
    messageKey: string
}

export const AddOppdragButton = ({ messageValue, messageKey }: Props) => {
    const handleMenuItemClick = async (e: Event) => {
        e.preventDefault()

        const formData = new FormData()
        formData.set('oppdragXml', messageValue)
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
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>Send til oppdrag</ActionMenuItem>
        </>
    )
}
