'use client'

import React, { ReactNode } from 'react'
import { BodyShort, Box, HStack, Label, VStack } from '@navikt/ds-react'

import {
    DagpengerUtbetalingMessageValue,
    Message,
    OppdragMessageValue,
    RawMessage,
    StatusMessageValue,
    TsUtbetalingMessageValue,
    UtbetalingMessageValue,
} from '@/app/kafka/types.ts'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const parsedXML = (data: string): XMLDocument => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'application/xml')
    const errorNode = doc.querySelector('parsererror')

    if (errorNode) {
        console.error(errorNode)
        console.log(data)
        throw Error('Failed to parse XML')
    }

    return doc
}

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

type Props = {
    message: RawMessage & Message
}

const DagpengerUtbetalingMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Dagpengeutbetaling mangler value')
    }

    const value: DagpengerUtbetalingMessageValue = JSON.parse(message.value)

    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Utbetaling</Label>
                <MetadataCardContainer>
                    <HStack wrap gap="space-12">
                        <MetadataCard label="Sak-ID" value={value.sakId} />
                        <MetadataCard label="Behandling-ID" value={value.behandlingId} />
                    </HStack>
                </MetadataCardContainer>
            </VStack>
        </VStack>
    )
}

const UtbetalingMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Utbetalingsmelding mangler value')
    }

    const value: UtbetalingMessageValue = JSON.parse(message.value)

    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Utbetaling</Label>
                <MetadataCardContainer>
                    <HStack wrap gap="space-12">
                        <MetadataCard label="Fagsystem" value={value.fagsystem} />
                        <MetadataCard label="Action" value={value.action} />
                        <MetadataCard
                            label="Første utbetaling på sak"
                            value={value.førsteUtbetalingPåSak ? 'Ja' : 'Nei'}
                        />
                        <MetadataCard label="Sak-ID" value={value.sakId} />
                        <MetadataCard label="Behandling-ID" value={value.behandlingId} />
                        <MetadataCard label="Stønad" value={value.stønad} />
                    </HStack>
                </MetadataCardContainer>
            </VStack>
            <VStack gap="space-12">
                <Label>Perioder</Label>
                {value.perioder.map((it, i) => (
                    <MetadataCardContainer key={i}>
                        <HStack wrap gap="space-12">
                            <MetadataCard label="Fom" value={it.fom} />
                            <MetadataCard label="Tom" value={it.tom} />
                            <MetadataCard label="Beløp" value={it.beløp} />
                            {!!it.vedtakssats && <MetadataCard label="Vedtakssats" value={it.vedtakssats} />}
                            {!!it.betalendeEnhet && <MetadataCard label="Betalende enhet" value={it.betalendeEnhet} />}
                        </HStack>
                    </MetadataCardContainer>
                ))}
            </VStack>
        </VStack>
    )
}

const TsUtbetalingMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Utbetalingsmelding mangler value')
    }

    const value: TsUtbetalingMessageValue = JSON.parse(message.value)

    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Utbetaling</Label>
                <MetadataCardContainer>
                    <HStack wrap gap="space-12">
                        <MetadataCard label="Sak-ID" value={value.sakId} />
                        <MetadataCard label="Behandling-ID" value={value.behandlingId} />
                    </HStack>
                </MetadataCardContainer>
            </VStack>
            {value.utbetalinger && value.utbetalinger.length > 0 && (
                <VStack gap="space-12">
                    <Label>Utbetalinger</Label>
                    {value.utbetalinger.map((utbetaling, i) => (
                        <MetadataCardContainer key={i}>
                            <VStack gap="space-12">
                                {utbetaling.perioder?.map((periode, j) => (
                                    <HStack key={j} wrap gap="space-12">
                                        <MetadataCard label="Fom" value={periode.fom} />
                                        <MetadataCard label="Tom" value={periode.tom} />
                                        <MetadataCard label="Beløp" value={periode.beløp} />
                                        <MetadataCard label="Stønad" value={utbetaling.stønad} />
                                        {!!periode.betalendeEnhet && (
                                            <MetadataCard label="Betalende enhet" value={periode.betalendeEnhet} />
                                        )}
                                    </HStack>
                                ))}
                            </VStack>
                        </MetadataCardContainer>
                    ))}
                </VStack>
            )}
        </VStack>
    )
}

const AvstemmingMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Avstemmingsmelding mangler value')
    }

    const xmlDoc = parsedXML(message.value)

    const fagsystem = xmlDoc.querySelector('aksjon > avleverendeKomponentKode')?.textContent

    if (!fagsystem) {
        return null
    }

    return (
        <VStack gap="space-12">
            <Label>Fagsystem</Label>
            <BodyShort>{fagsystem}</BodyShort>
        </VStack>
    )
}

const OppdragMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Oppdragsmelding mangler value')
    }

    const xmlDoc = parsedXML(message.value)

    const mmel: OppdragMessageValue['mmel'] = (() => {
        const mmel = xmlDoc.querySelector('mmel')
        return (
            mmel && {
                kodeMelding: mmel.querySelector('kodeMelding')?.textContent,
                alvorlighetsgrad: mmel.querySelector('alvorlighetsgrad')?.textContent,
                beskrMelding: mmel.querySelector('beskrMelding')?.textContent,
            }
        )
    })()

    const oppdrag: Partial<OppdragMessageValue['oppdrag-110']> = (() => {
        const oppdrag = xmlDoc.querySelector('oppdrag-110')
        if (!oppdrag) {
            throw Error('Oppdrag mangler oppdrag-110')
        }

        return {
            fagsystemId: oppdrag.querySelector('fagsystemId')?.textContent,
            kodeFagomraade: oppdrag.querySelector('kodeFagomraade')!.textContent!,
            kodeEndring: oppdrag.querySelector('kodeEndring')!.textContent!,
        }
    })()

    const summertSats = (() => {
        const oppdrag = xmlDoc.querySelector('oppdrag-110')
        if (!oppdrag) {
            return 0
        }

        const linjer = oppdrag.querySelectorAll('oppdrags-linje-150')

        return Array.from(linjer).reduce((sum, linje) => {
            const satsText = linje.querySelector('sats')?.textContent
            const sats = satsText ? parseFloat(satsText) : 0
            return sum + sats
        }, 0)
    })()

    return (
        <VStack gap="space-32">
            {mmel && (
                <VStack gap="space-12">
                    <Label>Mmel</Label>
                    <MetadataCardContainer>
                        <HStack wrap gap="space-12">
                            <MetadataCard label="Alvorlighetsgrad" value={mmel.alvorlighetsgrad} />
                            <MetadataCard label="Kodemelding" value={mmel.kodeMelding} />
                            <MetadataCard label="Beskrivende melding" value={mmel.beskrMelding} />
                        </HStack>
                    </MetadataCardContainer>
                </VStack>
            )}
            {oppdrag && (
                <VStack gap="space-12">
                    <Label>Oppdrag</Label>
                    <MetadataCardContainer>
                        <HStack wrap gap="space-12">
                            <MetadataCard label="Sak-ID" value={oppdrag.fagsystemId} />
                            <MetadataCard label="Fagsystem" value={oppdrag.kodeFagomraade} />
                            <MetadataCard label="Endringskode" value={oppdrag.kodeEndring} />
                            <MetadataCard label="Sats" value={summertSats} />
                        </HStack>
                    </MetadataCardContainer>
                </VStack>
            )}
        </VStack>
    )
}

const StatusMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Statusmelding mangler value')
    }

    const value = JSON.parse(message.value) as StatusMessageValue

    return (
        <VStack gap="space-32">
            <HStack gap="space-40">
                <VStack gap="space-12">
                    <Label>Status</Label>
                    <HStack gap="space-8">{value.status}</HStack>
                </VStack>
                {value.detaljer && (
                    <VStack gap="space-12">
                        <Label>Ytelse</Label>
                        <HStack gap="space-8">{value.detaljer.ytelse}</HStack>
                    </VStack>
                )}
            </HStack>
            {value.detaljer && value.detaljer.linjer.length > 0 && (
                <VStack gap="space-12">
                    <Label>Linjer</Label>
                    <VStack gap="space-16">
                        {value.detaljer.linjer.map((it, i) => (
                            <MetadataCardContainer key={i}>
                                <HStack wrap gap="space-12">
                                    <MetadataCard label="Behandling-ID" value={it.behandlingId} />
                                    <MetadataCard label="Fra og med" value={it.fom} />
                                    <MetadataCard label="Til og med" value={it.tom} />
                                    {!!it.vedtakssats && <MetadataCard label="Vedtakssats" value={it.vedtakssats} />}
                                    <MetadataCard label="Beløp" value={it.beløp} />
                                    <MetadataCard label="Klassekode" value={it.klassekode} />
                                </HStack>
                            </MetadataCardContainer>
                        ))}
                    </VStack>
                </VStack>
            )}
            {value.error && (
                <VStack gap="space-12">
                    <Label>Error</Label>
                    <MetadataCardContainer>
                        <HStack wrap gap="space-12">
                            <MetadataCard label="Statuskode" value={value.error.statusCode} />
                            <MetadataCard label="Melding" value={value.error.msg} />
                        </HStack>
                    </MetadataCardContainer>
                </VStack>
            )}
        </VStack>
    )
}

export const MessageMetadata: React.FC<Props> = ({ message }) => {
    return (
        <ErrorBoundary>
            {(() => {
                switch (message.topic_name) {
                    case 'helved.avstemming.v1':
                        return <AvstemmingMessageMetadata message={message} />
                    case 'helved.oppdrag.v1':
                    case 'helved.utbetalinger.v1':
                        return <UtbetalingMessageMetadata message={message} />
                    case 'helved.pending-utbetalinger.v1':
                        return <UtbetalingMessageMetadata message={message} />
                    case 'helved.status.v1':
                        return <StatusMessageMetadata message={message} />
                    case 'teamdagpenger.utbetaling.v1':
                        return <DagpengerUtbetalingMessageMetadata message={message} />
                    case 'tilleggsstonader.utbetaling.v1':
                        return <TsUtbetalingMessageMetadata message={message} />
                    case 'historisk.utbetaling.v1':
                        return <UtbetalingMessageMetadata message={message} />
                }
                return null
            })()}
        </ErrorBoundary>
    )
}
