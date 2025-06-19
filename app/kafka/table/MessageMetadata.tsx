import { Message, StatusMessageValue } from '@/app/kafka/types.ts'
import React from 'react'
import { HStack, Label, Table, VStack } from '@navikt/ds-react'
import {
    TableBody,
    TableDataCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { ErrorBoundary } from '@/components/ErrorBoundary'

type Props = {
    message: Message
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
                    <Table size="small">
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell textSize="small">
                                    Behandling-ID
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Fra og med
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Til og med
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Vedtakssats
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Beløp
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Klassekode
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {value.detaljer.linjer.map((it, i) => (
                                <TableRow key={i}>
                                    <TableDataCell>
                                        {it.behandlingId}
                                    </TableDataCell>
                                    <TableDataCell>{it.fom}</TableDataCell>
                                    <TableDataCell>{it.tom}</TableDataCell>
                                    <TableDataCell>
                                        {it.vedtakssats}
                                    </TableDataCell>
                                    <TableDataCell>{it.beløp}</TableDataCell>
                                    <TableDataCell>
                                        {it.klassekode}
                                    </TableDataCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                        break
                    case 'helved.oppdrag.v1':
                        break
                    case 'helved.oppdragsdata.v1':
                        break
                    case 'helved.dryrun-aap.v1':
                        break
                    case 'helved.dryrun-tp.v1':
                        break
                    case 'helved.dryrun-ts.v1':
                        break
                    case 'helved.dryrun-dp.v1':
                        break
                    case 'helved.kvittering.v1':
                        break
                    case 'helved.simuleringer.v1':
                        break
                    case 'helved.utbetalinger.v1':
                        break
                    case 'helved.saker.v1':
                        break
                    case 'helved.utbetalinger-aap.v1':
                        break
                    case 'helved.status.v1':
                        return <StatusMessageMetadata message={message} />
                }

                return null
            })()}
        </ErrorBoundary>
    )
}
