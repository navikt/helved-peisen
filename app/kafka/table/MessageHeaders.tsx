import { Message, RawMessage } from '@/app/kafka/types.ts'
import { BodyShort, Box, Label, VStack } from '@navikt/ds-react'

type Props = {
    message: RawMessage & Message
}

const HeaderCard = ({ label, value }: { label: string; value?: string | number | null }) => {
    if (!value) return null
    return (
        <Box background="neutral-soft" padding="space-16" borderRadius="8">
            <VStack gap="space-12">
                <Label size="small">{label}</Label>
                <BodyShort>{value}</BodyShort>
            </VStack>
        </Box>
    )
}

// Disse er ikke så interesante
const EXCLUDED_HEADERS = new Set(['x-ts', 'x-st', 'x-sy', 'traceparent'])

const MessageHeaders = ({ message }: Props) => {
    const headers = message.headers?.filter((header) => !EXCLUDED_HEADERS.has(header.key))
    if (!headers?.length) return null

    return (
        <VStack gap="space-12">
            <Label>Headers</Label>
            <Box background="neutral-moderate" padding="space-12" borderRadius="8" maxWidth="max-content">
                {headers.map((header) => (
                    <HeaderCard key={header.key} label={header.key} value={header.value} />
                ))}
            </Box>
        </VStack>
    )
}

export default MessageHeaders