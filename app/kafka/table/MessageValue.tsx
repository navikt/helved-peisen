'use client'

import React from 'react'
import { Label, Switch, VStack } from '@navikt/ds-react'
import { teamLogger } from '@navikt/next-logger/team-log'

import type { Message, RawMessage } from '@/app/kafka/types.ts'
import { XMLView } from '@/components/XMLView.tsx'
import { JsonView } from '@/components/JsonView.tsx'
import { useUser } from '@/components/UserProvider'

const showMessagePayload = () => {
    const isLocal = window.location.host.includes('localhost')
    const isDev = window.location.host.includes('dev')
    return isLocal || isDev
}

type Props = {
    message: RawMessage & Message
}

export const MessageValue: React.FC<Props> = ({ message }) => {
    const [showValue, setShowValue] = React.useState(showMessagePayload())
    const user = useUser()

    const data = (() => {
        try {
            return JSON.parse(message.value!)
        } catch {
            return message.value
        }
    })()

    return (
        <>
            {!showMessagePayload() && (
                <Switch
                    size="small"
                    checked={showValue}
                    onChange={(event) => {
                        setShowValue(event.target.checked)
                        if (event.target.checked) {
                            teamLogger.info(
                                `${user?.name} (${user?.ident}) ser på melding fra topic ${message.topic_name} med partition ${message.partition}, offset ${message.offset}, og key ${message.key}`
                            )
                        }
                    }}
                >
                    Vis melding
                </Switch>
            )}
            {showValue && (
                <VStack gap="space-4">
                    <Label>Value</Label>
                    {typeof data === 'string' ? <XMLView data={data} /> : <JsonView json={data} />}
                </VStack>
            )}
        </>
    )
}
