import React, { ReactNode } from 'react'
import { BodyShort, Box, HStack, Label, VStack } from '@navikt/ds-react'
import { Detaljs, Grunnlag } from '@/app/avstemming/types.ts'

type MetadataCardProps = {
    label: string
    value?: string | number | null
}

const MetadataCard: React.FC<MetadataCardProps> = ({ label, value }) => {
    if (!value) {
        return null
    }
    return (
        <Box background="neutral-soft" padding="space-16" borderRadius="8">
            <VStack gap="space-12">
                <Label size="small">{label}</Label>
                <BodyShort>{value}</BodyShort>
            </VStack>
        </Box>
    )
}

type MetadataCardContainerProps = {
    children: ReactNode
}

const MetadataCardContainer: React.FC<MetadataCardContainerProps> = ({ children }) => {
    return (
        <Box background="neutral-moderate" padding="space-12" borderRadius="8" maxWidth="max-content">
            {children}
        </Box>
    )
}

export default function ResultTableRow({ grunnlag, detaljs }: { grunnlag: Grunnlag; detaljs: Detaljs[] }) {
    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label size="small">Grunnlag</Label>
                <VStack gap="space-16">
                    {[
                        { label: 'Godkjent', antall: grunnlag.godkjentAntall, belop: grunnlag.godkjentBelop },
                        { label: 'Varsel', antall: grunnlag.varselAntall, belop: grunnlag.varselBelop },
                        { label: 'Avvist', antall: grunnlag.avvistAntall, belop: grunnlag.avvistBelop },
                        { label: 'Mangler', antall: grunnlag.manglerAntall, belop: grunnlag.manglerBelop },
                    ]
                        .filter((row) => row.antall > 0)
                        .map((row) => (
                            <MetadataCardContainer key={row.label}>
                                <HStack wrap gap="space-12">
                                    <MetadataCard label="Status" value={row.label} />
                                    <MetadataCard label="Antall" value={row.antall.toLocaleString()} />
                                    <MetadataCard label="Beløp" value={row.belop.toLocaleString('nb-NO')} />
                                </HStack>
                            </MetadataCardContainer>
                        ))}
                </VStack>
            </VStack>

            {detaljs.length > 0 && (
                <VStack gap="space-12">
                    <Label size="small">Avviste transaksjoner</Label>
                    <VStack gap="space-16">
                        {detaljs.map((d, i) => (
                            <MetadataCardContainer key={i}>
                                <HStack wrap gap="space-12">
                                    <MetadataCard label="Type" value={d.detaljType} />
                                    <MetadataCard label="Nøkkel" value={d.avleverendeTransaksjonNokkel} />
                                    <MetadataCard label="Melding" value={d.tekstMelding} />
                                    <MetadataCard label="Tidspunkt" value={d.tidspunkt.slice(0, 19)} />
                                </HStack>
                            </MetadataCardContainer>
                        ))}
                    </VStack>
                </VStack>
            )}
        </VStack>
    )
}