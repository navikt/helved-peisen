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
import { DataMelding, getFom, getTom, isDataMelding } from '@/app/avstemming/types'
import { XMLView } from '@/components/XMLView'
import { format } from 'date-fns'
import { ResultTableRow } from '@/app/avstemming/table/ResultTableRow.tsx'
import { useAvstemminger } from './AvstemingContext'
import { ResultTableSkeleton } from './table/ResultTable'

type StatusTagProps = {
    avstemming: DataMelding
}

const StatusTag: React.FC<StatusTagProps> = ({ avstemming }) => {
    const { avvistAntall, varselAntall, manglerAntall } = avstemming.grunnlag
    if (avvistAntall > 0)
        return (
            <Tag variant="error" size="small">
                {avvistAntall} avvist
            </Tag>
        )
    if (varselAntall > 0 || manglerAntall > 0)
        return (
            <Tag variant="warning" size="small">
                {varselAntall + manglerAntall} varsler/mangler
            </Tag>
        )
    if (avstemming.total.totalAntall === 0)
        return (
            <Tag variant="neutral" size="small">
                Ingen
            </Tag>
        )
    return (
        <Tag variant="success" size="small">
            OK
        </Tag>
    )
}

export const LatestAvstemminger: React.FC = () => {
    const { loading, avstemminger } = useAvstemminger()

    if (loading) {
        return (
            <VStack gap="space-16">
                <Label>Siste avstemminger</Label>
                <ResultTableSkeleton />
            </VStack>
        )
    }

    if (!avstemminger || !avstemminger.data) {
        return null
    }

    const datameldinger = avstemminger.data.filter((it) => isDataMelding(it.avstemming)) as unknown as {
        xml: string
        avstemming: DataMelding
    }[]

    const latest = Map.groupBy(datameldinger, ({ avstemming }) => avstemming.aksjon.avleverendeKomponentKode)
        .entries()
        .toArray()
        .map(([fagsystem, avstemminger]) => {
            const latest = avstemminger.reduce((latest, current) =>
                current.avstemming.periode.datoAvstemtFom > latest.avstemming.periode.datoAvstemtFom ? current : latest
            )
            return {
                fagsystem: fagsystem,
                avstemming: latest.avstemming,
                xml: latest.xml,
            }
        })

    if (latest.length === 0) {
        return <Alert variant="info">Ingen avstemminger funnet</Alert>
    }

    return (
        <div className="flex flex-col gap-4 w-full">
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
                            <TableHeaderCell>Fom</TableHeaderCell>
                            <TableHeaderCell>Tom</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {latest.map(({ fagsystem, avstemming, xml }) => {
                            const datamelding = avstemming as DataMelding
                            return (
                                <TableExpandableRow
                                    key={fagsystem}
                                    content={
                                        <VStack gap="space-32">
                                            <ResultTableRow
                                                grunnlag={datamelding.grunnlag}
                                                detaljs={datamelding.detaljs}
                                            />

                                            <VStack gap="space-12">
                                                <Label>XML</Label>
                                                <XMLView data={xml} />
                                            </VStack>
                                        </VStack>
                                    }
                                >
                                    <TableDataCell>{fagsystem}</TableDataCell>
                                    <TableDataCell>
                                        <StatusTag avstemming={datamelding} />
                                    </TableDataCell>
                                    <TableDataCell>{datamelding.total.totalAntall}</TableDataCell>
                                    <TableDataCell>
                                        {datamelding.total.totalBelop.toLocaleString('nb-NO')}
                                    </TableDataCell>
                                    <TableDataCell>{format(getFom(datamelding), 'yyyy-MM-dd')}</TableDataCell>
                                    <TableDataCell>{format(getTom(datamelding), 'yyyy-MM-dd')}</TableDataCell>
                                </TableExpandableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
