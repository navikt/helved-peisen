'use client'

import React from 'react'
import { BodyShort, HStack, Label, Table, VStack } from '@navikt/ds-react'
import { TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { isBefore } from 'date-fns/isBefore'
import { isAfter } from 'date-fns'

import type {
    DagpengerUtbetalingMessageValue,
    Message,
    OppdragMessageValue,
    RawMessage,
    StatusMessageValue,
    TsUtbetalingMessageValue,
    UtbetalingMessageValue,
} from '@/app/kafka/types.ts'
import { parsedXML } from '@/lib/browser/xml.ts'
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx'
import { Card } from '@/components/Card'

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
                <HStack wrap gap="space-12">
                    <Card label="Sak-ID">{value.sakId}</Card>
                    <Card label="Behandling-ID">{value.behandlingId}</Card>
                </HStack>
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
                <HStack wrap gap="space-12">
                    <Card label="Fagsystem">{value.fagsystem}</Card>
                    <Card label="Action">{value.action}</Card>
                    <Card label="Første utbetaling på sak">{value.førsteUtbetalingPåSak ? 'Ja' : 'Nei'}</Card>
                    <Card label="Sak-ID">{value.sakId}</Card>
                    <Card label="Behandling-ID">{value.behandlingId}</Card>
                    <Card label="Stønad">{value.stønad}</Card>
                </HStack>
            </VStack>
            <VStack gap="space-12">
                <Label>Perioder</Label>
                <Table size="small">
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell textSize="small">Fom</TableHeaderCell>
                            <TableHeaderCell textSize="small">Tom</TableHeaderCell>
                            <TableHeaderCell textSize="small">Beløp</TableHeaderCell>
                            <TableHeaderCell textSize="small">Vedtakssats</TableHeaderCell>
                            <TableHeaderCell textSize="small">Betalende enhet</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {value.perioder.map((it, i) => (
                            <TableRow key={i}>
                                <TableDataCell>{it.fom}</TableDataCell>
                                <TableDataCell>{it.tom}</TableDataCell>
                                <TableDataCell>{it.beløp}</TableDataCell>
                                <TableDataCell>{!!it.vedtakssats ? it.vedtakssats : '-'}</TableDataCell>
                                <TableDataCell>{!!it.betalendeEnhet ? it.betalendeEnhet : '-'}</TableDataCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </VStack>
        </VStack>
    )
}

const TsUtbetalingMessageMetadata: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        throw Error('Utbetalingsmelding mangler value')
    }

    const value: TsUtbetalingMessageValue = JSON.parse(message.value)

    const perioder = value.utbetalinger.flatMap((utbetaling) =>
        utbetaling.perioder.map((periode) => ({ ...periode, stønad: utbetaling.stønad }))
    )

    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Utbetaling</Label>
                <HStack wrap gap="space-12">
                    <Card label="Sak-ID">{value.sakId}</Card>
                    <Card label="Behandling-ID">{value.behandlingId}</Card>
                </HStack>
            </VStack>
            {value.utbetalinger && value.utbetalinger.length > 0 && (
                <VStack gap="space-12">
                    <Label>Utbetalinger</Label>
                    <Table size="small">
                        <TableBody>
                            {perioder.map((periode, i) => (
                                <TableRow key={i}>
                                    <TableDataCell>{periode.fom}</TableDataCell>
                                    <TableDataCell>{periode.tom}</TableDataCell>
                                    <TableDataCell>{periode.beløp}</TableDataCell>
                                    <TableDataCell>{periode.stønad}</TableDataCell>
                                    <TableDataCell>
                                        {periode.betalendeEnhet ? periode.betalendeEnhet : '-'}
                                    </TableDataCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell textSize="small">Fom</TableHeaderCell>
                                <TableHeaderCell textSize="small">Tom</TableHeaderCell>
                                <TableHeaderCell textSize="small">Beløp</TableHeaderCell>
                                <TableHeaderCell textSize="small">Stønad</TableHeaderCell>
                                <TableHeaderCell textSize="small">Betalende enhet</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                    </Table>
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
        <Card label="Fagsystem">
            <BodyShort>{fagsystem}</BodyShort>
        </Card>
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

    const oppdrag = (() => {
        const oppdrag = xmlDoc.querySelector('oppdrag-110')
        if (!oppdrag) {
            throw Error('Oppdrag mangler oppdrag-110')
        }

        return {
            fagsystemId: oppdrag.querySelector('fagsystemId')?.textContent,
            kodeFagomraade: oppdrag.querySelector('kodeFagomraade')!.textContent!,
            kodeEndring: oppdrag.querySelector('kodeEndring')!.textContent!,
            linjer: oppdrag.querySelectorAll('oppdrags-linje-150'),
        }
    })()

    const totalSats = (() => {
        return Array.from(oppdrag.linjer).reduce((sum, linje) => {
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
                    <HStack wrap gap="space-12">
                        {mmel.alvorlighetsgrad && <Card label="Alvorlighetsgrad">{mmel.alvorlighetsgrad}</Card>}
                        {mmel.kodeMelding && <Card label="Kodemelding">{mmel.kodeMelding}</Card>}
                        {mmel.beskrMelding && <Card label="Beskrivende melding">{mmel.beskrMelding}</Card>}
                    </HStack>
                </VStack>
            )}
            {oppdrag && (
                <VStack gap="space-12">
                    <Label>Oppdrag</Label>
                    <HStack wrap gap="space-12">
                        {oppdrag.fagsystemId && <Card label="Sak-ID">{oppdrag.fagsystemId}</Card>}
                        {oppdrag.kodeFagomraade && <Card label="Fagsystem">{oppdrag.kodeFagomraade}</Card>}
                        {oppdrag.kodeEndring && <Card label="Endringskode">{oppdrag.kodeEndring}</Card>}
                        {!!totalSats && <Card label="Total sats">{totalSats}</Card>}
                    </HStack>
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

    const linjer = value.detaljer?.linjer ?? []
    const opphørsLinjer = linjer.filter(
        (linje) => linje.beløp === 0 && (linje.vedtakssats == null || linje.vedtakssats >= 0)
    )

    const opphør =
        opphørsLinjer.length === 0
            ? null
            : (() => ({
                  antallLinjer: opphørsLinjer.length,
                  fom: opphørsLinjer.reduce((fom, linje) => (isBefore(fom, linje.fom) ? fom : linje.fom), '9999-01-01'),
                  tom: opphørsLinjer.reduce((tom, linje) => (isAfter(tom, linje.tom) ? tom : linje.tom), '1970-01-01'),
              }))()

    return (
        <VStack gap="space-32">
            <HStack gap="space-12">
                <Card label="Status">{value.status}</Card>
                {value.detaljer && <Card label="Ytelse">{value.detaljer.ytelse}</Card>}
            </HStack>
            {value.detaljer && value.detaljer.linjer.length > 0 && (
                <VStack gap="space-12">
                    <Label>Linjer</Label>
                    <Table size="small">
                        <TableBody>
                            {value.detaljer.linjer.map((it, i) => (
                                <TableRow key={i}>
                                    <TableDataCell>{it.behandlingId}</TableDataCell>
                                    <TableDataCell>{it.fom}</TableDataCell>
                                    <TableDataCell>{it.tom}</TableDataCell>
                                    <TableDataCell>{it.vedtakssats}</TableDataCell>
                                    <TableDataCell>{it.beløp}</TableDataCell>
                                    <TableDataCell>{it.klassekode}</TableDataCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell textSize="small">Behandling-ID</TableHeaderCell>
                                <TableHeaderCell textSize="small">Fom</TableHeaderCell>
                                <TableHeaderCell textSize="small">Tom</TableHeaderCell>
                                <TableHeaderCell textSize="small">Beløp</TableHeaderCell>
                                <TableHeaderCell textSize="small">Vedtakssats</TableHeaderCell>
                                <TableHeaderCell textSize="small">Klassekode</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                    </Table>
                </VStack>
            )}
            {value.error && (
                <VStack gap="space-12">
                    <Label>Error</Label>
                    <HStack wrap gap="space-12">
                        <Card label="Statuskode">{value.error.statusCode}</Card>
                        <Card label="Melding">{value.error.msg}</Card>
                    </HStack>
                </VStack>
            )}
            {opphør && (
                <VStack gap="space-12">
                    <Label>Opphør</Label>
                    <HStack wrap gap="space-12">
                        <Card label="Fom">{opphør.fom}</Card>
                        <Card label="Tom">{opphør.tom}</Card>
                        <Card label="Antall linjer">{opphør.antallLinjer}</Card>
                    </HStack>
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
                        return <OppdragMessageMetadata message={message} />
                    case 'helved.utbetalinger.v1':
                    case 'helved.pending-utbetalinger.v1':
                    case 'historisk.utbetaling.v1':
                        return <UtbetalingMessageMetadata message={message} />
                    case 'helved.status.v1':
                        return <StatusMessageMetadata message={message} />
                    case 'teamdagpenger.utbetaling.v1':
                        return <DagpengerUtbetalingMessageMetadata message={message} />
                    case 'tilleggsstonader.utbetaling.v1':
                        return <TsUtbetalingMessageMetadata message={message} />
                }
                return null
            })()}
        </ErrorBoundary>
    )
}
