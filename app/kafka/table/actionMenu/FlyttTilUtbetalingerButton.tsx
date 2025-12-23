import React from 'react'
import { logger } from '@navikt/next-logger'

import { movePendingToUtbetaling } from '@/app/actions.ts'
import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'

type Props = {
    messageValue: string
    messageKey: string
}

export const FlyttTilUtbetalingerButton = ({ messageValue, messageKey }: Props) => {
    const handleMenuItemClick = async (e: Event) => {
        e.preventDefault()

        const formData = new FormData()
        formData.set('oppdragXml', messageValue)
        formData.set('messageKey', messageKey)

        const response = await movePendingToUtbetaling(formData)
        if (response.error) {
            const message = `Feil ved manuell flytting av pending utbetaling til utbetalinger: ${response.error.message}`
            logger.error(message)
            showToast(message, { variant: 'error' })
        } else {
            showToast(`Flyttet pending utbetaling til utbetalinger for "${messageKey}"`, {
                variant: 'success',
            })
        }
    }

    return (
        <>
            <ActionMenuItem onSelect={handleMenuItemClick}>Flytt til helved.utbetalinger.v1</ActionMenuItem>
        </>
    )
}
