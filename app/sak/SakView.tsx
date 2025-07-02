'use client'

import { BodyShort, BoxNew, Label, Tag, VStack } from '@navikt/ds-react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { format } from 'date-fns/format'

import { MessageTableRowContents } from '@/app/kafka/table/MessageTableRow.tsx'
import { Message } from '@/app/kafka/types.ts'
import { variant } from '@/lib/message.ts'
import { useSak } from './SakProvider'

import fadeIn from '@/styles/fadeIn.module.css'
import styles from './SakView.module.css'

const type = (message: Message): string => {
    return (() => {
        switch (message.topic_name) {
            case 'helved.avstemming.v1':
                return 'Avstemming'
            case 'helved.oppdrag.v1':
                return 'Oppdrag'
            case 'helved.oppdragsdata.v1':
                return 'Oppdragsdata'
            case 'helved.kvittering.v1':
                return 'Kvittering'
            case 'helved.dryrun-aap.v1':
            case 'helved.dryrun-tp.v1':
            case 'helved.dryrun-ts.v1':
            case 'helved.dryrun-dp.v1':
            case 'helved.simuleringer.v1':
                return 'Simulering'
            case 'helved.utbetalinger.v1':
                return 'Utbetaling'
            case 'helved.saker.v1':
                return 'Sak'
            case 'helved.utbetalinger-aap.v1':
                return 'Utbetaling-AAP'
            case 'helved.status.v1':
                return 'Status'
        }
    })()
}

const fagsystem = (fagsystem: string) => {
    switch (fagsystem) {
        case 'TILLST':
            return 'Tilleggsstønader'
        case 'TILTPENG':
            return 'Tiltakspenger'
        case 'DP':
            return 'Dagpenger'
        case 'AAP':
            return 'AAP'
        default:
            return fagsystem
    }
}

export const SakView = () => {
    const { sak } = useSak()

    if (!sak || sak.hendelser.length === 0) {
        return null
    }

    return (
        <VStack gap="space-32" className={fadeIn.animation}>
            <VStack gap="space-12">
                <Label>Sak-ID</Label>
                <BodyShort>{sak.id}</BodyShort>
            </VStack>
            <VStack gap="space-12">
                <Label>Fagsystem</Label>
                <BodyShort>{fagsystem(sak.fagsystem)}</BodyShort>
            </VStack>
            <VStack gap="space-12">
                <Label>Hendelser</Label>
                <BoxNew
                    borderRadius="large"
                    background="neutral-soft"
                    padding="4"
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell />
                                <TableHeaderCell textSize="small">
                                    Type
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Timestamp
                                </TableHeaderCell>
                                <TableHeaderCell textSize="small">
                                    Key
                                </TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sak.hendelser.map((it, i) => (
                                <TableExpandableRow
                                    key={it.key + it.timestamp_ms + i}
                                    content={
                                        <MessageTableRowContents message={it} />
                                    }
                                >
                                    <TableDataCell>
                                        <Tag variant={variant(it)}>
                                            {type(it)}
                                        </Tag>
                                    </TableDataCell>
                                    <TableDataCell className={styles.cell}>
                                        {format(
                                            it.timestamp_ms,
                                            'yyyy-MM-dd - HH:mm:ss.SSS'
                                        )}
                                    </TableDataCell>
                                    <TableDataCell>{it.key}</TableDataCell>
                                </TableExpandableRow>
                            ))}
                        </TableBody>
                    </Table>
                </BoxNew>
            </VStack>
        </VStack>
    )
}
