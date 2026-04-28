import { BodyShort, Box, Heading, Label, VStack } from '@navikt/ds-react'

export default function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <Box background="neutral-soft" borderRadius="8" padding="space-16">
            <VStack gap="space-8">
                <Label size="small">{label}</Label>
                <Heading level="3" size="small">
                    {value}
                </Heading>
                <BodyShort size="small">{hint}</BodyShort>
            </VStack>
        </Box>
    )
}