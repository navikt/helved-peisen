import { Message, RawMessage } from '@/app/kafka/types.ts'
import { BodyShort, Box, Label, VStack } from '@navikt/ds-react'
import React, { ReactNode } from 'react'

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

const HeaderCardContainer = ({ children }: { children: ReactNode }) => (
    <Box background="neutral-moderate" padding="space-12" borderRadius="8" maxWidth="max-content">
        {children}
    </Box>
)

const HeadersLayout = ({ children }: { children: ReactNode }) => (
    <VStack gap="space-12">
        <Label>Headers</Label>
        <HeaderCardContainer>
            {children}
        </HeaderCardContainer>
    </VStack>
)

const FagsystemHeaders = ({ message }: Props) => {
    const fagsystem = message.headers?.find((header) => header.key === 'fagsystem')?.value
    if (!fagsystem) return null

    return (
        <HeadersLayout>
            <HeaderCard label="Fagsystem" value={fagsystem} />
        </HeadersLayout>
    )
}

const MessageHeaders = ({ message }: Props) => {
    return <FagsystemHeaders message={message} />
}

export default MessageHeaders