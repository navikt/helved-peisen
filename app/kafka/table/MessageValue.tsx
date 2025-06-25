import React from 'react'
import { Label, VStack } from '@navikt/ds-react'

import { Message } from '@/app/kafka/types.ts'
import { XMLView } from '@/components/XMLView.tsx'
import { JsonView } from '@/components/JsonView.tsx'

const showMessagePayload = () => {
    const isLocal = window.location.host.includes('localhost')
    const isDev = window.location.host.includes('dev')
    return isLocal || isDev
}

type Props = {
    message: Message
}

export const MessageValue: React.FC<Props> = ({ message }) => {
    if (!showMessagePayload()) {
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
