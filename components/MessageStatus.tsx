import { Tag } from '@navikt/ds-react'
import { Message } from '../app/kafka/types.ts'

const variantForStatus = (status: Message['status']) => {
    switch (status) {
        case 'OK':
            return 'success'
        case 'FEILET':
            return 'error'
        default:
            return 'neutral'
    }
}

type Props = {
    message: Message
}

export const MessageStatus: React.FC<Props> = ({ message }) => {
    if (!message.status) return null

    return (
        <Tag size="xsmall" variant={variantForStatus(message.status)}>
            {message.status}
        </Tag>
    )
}
