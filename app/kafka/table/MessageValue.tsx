import { Message } from '@/app/kafka/types.ts'
import { Label, VStack } from '@navikt/ds-react'
import { XMLView } from '@/components/XMLView.tsx'
import { JsonView } from '@/components/JsonView.tsx'
import React from 'react'

type Props = {
    message: Message
}

export const MessageValue: React.FC<Props> = ({ message }) => {
    const showMessagePayload = process.env.NEXT_PUBLIC_SHOW_MESSAGE_PAYLOAD
    if (!showMessagePayload || showMessagePayload === 'false') {
        return null
    }

    const data = (() => {
        try {
            return JSON.parse(message.value!)
        } catch {
            return message.value
        }
    })()

    return (
        <VStack gap="space-4">
            <Label>Value</Label>
            {typeof data === 'string' ? (
                <XMLView data={data} />
            ) : (
                <JsonView json={data} />
            )}
        </VStack>
    )
}
