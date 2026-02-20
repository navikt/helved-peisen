import { showToast } from '@/components/Toast.tsx'

import { ActionMenuItem } from '@navikt/ds-react/ActionMenu'
import { movePendingToUtbetaling } from './actions'
import type { Message } from '@/app/kafka/types'

type Props = {
    message: Message
}

export const FlyttTilUtbetalingerButton = ({ message }: Props) => {
    const handleMenuItemClick = async (e: Event) => {
        e.preventDefault()

        const formData = new FormData()
        formData.set('topic', message.topic_name)
        formData.set('partition', `${message.partition}`)
        formData.set('offset', `${message.offset}`)

        const response = await movePendingToUtbetaling(formData)
        if (response.status === 'error') {
            showToast(response.message ?? `Feil ved manuell flytting av pending utbetaling til utbetalinger`, {
                variant: 'error',
            })
        } else {
            showToast(`Flyttet pending utbetaling til utbetalinger for "${message.key}"`, {
                variant: 'success',
            })
        }
    }

    return <ActionMenuItem onSelect={handleMenuItemClick}>Flytt til helved.utbetalinger.v1</ActionMenuItem>
}
