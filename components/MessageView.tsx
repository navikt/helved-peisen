import React, { useEffect, useState } from 'react'
import { Message, RawMessage } from '@/app/kafka/types'
import { useUser } from '@/app/UserProvider'
import { fetchRawMessage } from '@/app/kafka/actions'
import { isSuccessResponse } from '@/lib/api/types.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import { teamLogger } from '@navikt/next-logger/team-log'
import { CopyButton, HStack, Skeleton, VStack } from '@navikt/ds-react'
import { MessageHeaders } from '@/app/kafka/table/MessageHeaders.tsx'
import { MessageMetadata } from '@/components/MessageMetadata.tsx'
import { MessageValue } from '@/components/MessageValue.tsx'
import { Card } from '@/components/Card.tsx'

type Props = {
    message: Message
}

export const MessageView: React.FC<Props> = ({ message }) => {
    const [rawMessage, setRawMessage] = useState<(Message & RawMessage) | null>(null)
    const [loading, setLoading] = useState(true)
    const user = useUser()

    useEffect(() => {
        setLoading(true)
        fetchRawMessage(message)
            .then((res) => {
                if (isSuccessResponse(res)) {
                    setRawMessage({ ...message, ...res.data })
                } else {
                    showToast(res.error, { variant: 'error' })
                }
            })
            .catch((e) => {
                showToast(`Klarte ikke hente melding: ${e.message}`, { variant: 'error' })
            })
            .finally(() => {
                teamLogger.info(
                    `${user?.name} (${user?.ident}) hentet melding fra topic ${message.topic_name} med partition ${message.partition}, offset ${message.offset}, og key ${message.key}`
                )
                setLoading(false)
            })
    }, [message, user])

    if (loading) {
        return <Skeleton width="100%" height="100%" />
    }

    return (
        <VStack gap="space-32">
            {rawMessage && (
                <>
                    <Card label="Key">
                        <HStack gap="space-8">
                            {rawMessage.key}
                            <CopyButton size="xsmall" copyText={rawMessage.key} />
                        </HStack>
                    </Card>
                    <MessageMetadata message={rawMessage} />
                    <MessageHeaders message={message} />
                    <MessageValue message={rawMessage} />
                </>
            )}
        </VStack>
    )
}
