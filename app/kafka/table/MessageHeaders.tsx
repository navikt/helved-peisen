import { Message, RawMessage } from '@/app/kafka/types.ts'
import { Card } from '@/components/Card'
import { HStack, Label, VStack } from '@navikt/ds-react'
import { capitalize } from '@/lib/string.ts'

type Props = {
    message: RawMessage & Message
}

const EXCLUDED_HEADERS = new Set(['x-ts', 'x-st', 'x-sy', 'traceparent'])

export const MessageHeaders = ({ message }: Props) => {
    const headers = message.headers?.filter((header) => header.value && !EXCLUDED_HEADERS.has(header.key))
    if (!headers?.length) return null

    return (
        <VStack gap="space-12">
            <Label>Headers</Label>
            <HStack gap="space-12">
                {headers.map((header) => (
                    <Card key={header.key} label={capitalize(header.key)}>
                        {header.value}
                    </Card>
                ))}
            </HStack>
        </VStack>
    )
}
