'use client'

import { Alert, Label, Table, Tag, VStack } from '@navikt/ds-react'
import {
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { Avstemming } from '@/app/avstemming/types'
import { parseAvstemmingXml } from '@/app/avstemming/parseAvstemmingXml'
import { XMLView } from '@/components/XMLView'
import { format } from 'date-fns'
import React from 'react'
import ResultTableRow from '@/app/avstemming/table/ResultTableRow.tsx'

interface ParsedXml {
    avstemming: Avstemming
    xml: string
}

function StatusTag({ avstemming }: { avstemming: Avstemming }) {
    const { avvistAntall, varselAntall, manglerAntall } = avstemming.grunnlag
    if (avvistAntall > 0) return <Tag variant="error" size="small">{avvistAntall} avvist</Tag>
    if (varselAntall > 0 || manglerAntall > 0) return <Tag variant="warning" size="small">{varselAntall + manglerAntall} varsler/mangler</Tag>
    if (avstemming.totalAntall === 0) return <Tag variant="neutral" size="small">Ingen</Tag>
    return <Tag variant="success" size="small">OK</Tag>
}

function getLatestPerFagsystem(items: ParsedXml[]): ParsedXml[] {
    const grouped = Map.groupBy(items, (i) => i.avstemming.fagsystem)
    return [...grouped.values()].map((group) =>
        group.reduce((latest, current) =>
            current.avstemming.dato > latest.avstemming.dato ? current : latest
        )
    )
}

interface Props {
    xmlMessages: string[]
}

export function LatestAvstemminger({ xmlMessages }: Props) {
    const parsed: ParsedXml[] = xmlMessages.flatMap((xml) => {
        const avstemming = parseAvstemmingXml(xml)
        return avstemming ? [{ avstemming: avstemming, xml }] : []
    })

    const latest = getLatestPerFagsystem(parsed)

    if (latest.length === 0) {
        return <Alert variant="info">Ingen avstemminger funnet</Alert>
    }

    return (
        <VStack gap="space-16" style={{ marginTop: '3rem' }}>
            <Label>Siste avstemminger</Label>
            <div className="max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                <Table size="small" className="h-max overflow-scroll">
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell />
                            <TableHeaderCell>Fagområde</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Antall</TableHeaderCell>
                            <TableHeaderCell>Beløp</TableHeaderCell>
                            <TableHeaderCell>Dato</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {latest.map(({ avstemming, xml }) => (
                            <TableExpandableRow
                                key={avstemming.fagsystem}
                                content={
                                    <VStack gap="space-32">
                                        <ResultTableRow grunnlag={avstemming.grunnlag} detaljs={avstemming.detaljs} />

                                    <VStack gap="space-12">
                                        <Label>XML</Label>
                                        <XMLView data={xml} />
                                    </VStack>
                                    </VStack>
                                }
                            >
                                <TableDataCell>{avstemming.fagsystem}</TableDataCell>
                                <TableDataCell>
                                    <StatusTag avstemming={avstemming} />
                                </TableDataCell>
                                <TableDataCell>{avstemming.totalAntall}</TableDataCell>
                                <TableDataCell>{avstemming.totalBelop.toLocaleString('nb-NO')}</TableDataCell>
                                <TableDataCell>{format(avstemming.dato, 'yyyy-MM-dd')}</TableDataCell>
                            </TableExpandableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </VStack>
    )
}
