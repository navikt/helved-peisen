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
import { AvstemmingResponse, DataMelding, isDataMelding } from '@/app/avstemming/types.ts'
import { ResultTableRow } from '@/app/avstemming/table/ResultTableRow.tsx'
import { JsonView } from '@/components/JsonView.tsx'

type StatusTagProps = {
    grunnlag: DataMelding['grunnlag']
}

const StatusTag: React.FC<StatusTagProps> = ({ grunnlag }) => {
    if (grunnlag.avvistAntall > 0)
        return (
            <Tag variant="error" size="small">
                {grunnlag.avvistAntall} avvist
            </Tag>
        )
    if (grunnlag.varselAntall > 0)
        return (
            <Tag variant="warning" size="small">
                {grunnlag.varselAntall} varsler
            </Tag>
        )
    return (
        <Tag variant="success" size="small">
            OK
        </Tag>
    )
}

type ResultTableProps = { avstemming: AvstemmingResponse }

export const ResultTable: React.FC<ResultTableProps> = ({ avstemming }) => {
    if (!avstemming || avstemming.length === 0) {
        return <Alert variant="info">Ingen avstemminger i perioden</Alert>
    }

    return (
        <VStack gap="space-16">
            <div className="max-w-[100vw] overflow-y-auto scrollbar-gutter-stable">
                <Table size="small" className="h-max overflow-scroll">
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell />
                            <TableHeaderCell>Fagområde</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Antall</TableHeaderCell>
                            <TableHeaderCell>Beløp</TableHeaderCell>
                            <TableHeaderCell>Fom</TableHeaderCell>
                            <TableHeaderCell>Tom</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {avstemming.map((it) => {
                            const avstemming = it.second.find(isDataMelding)
                            if (!avstemming?.total || !avstemming.grunnlag) return null

                            const { total, grunnlag, detaljs } = avstemming

                            return (
                                <TableExpandableRow
                                    key={it.first}
                                    content={
                                        <VStack gap="space-32">
                                            <ResultTableRow grunnlag={grunnlag} detaljs={detaljs ?? []} />
                                            <VStack gap="space-12">
                                                <Label>JSON</Label>
                                                <JsonView json={it} />
                                            </VStack>
                                        </VStack>
                                    }
                                >
                                    <TableDataCell>{it.first}</TableDataCell>
                                    <TableDataCell>
                                        <StatusTag grunnlag={grunnlag} />
                                    </TableDataCell>
                                    <TableDataCell>{total.totalAntall}</TableDataCell>
                                    <TableDataCell>{total.totalBelop.toLocaleString('nb-NO')}</TableDataCell>
                                    <TableDataCell>{avstemming.aksjon?.nokkelFom.slice(0, 19)}</TableDataCell>
                                    <TableDataCell>{avstemming.aksjon?.nokkelTom.slice(0, 19)}</TableDataCell>
                                </TableExpandableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </VStack>
    )
}
