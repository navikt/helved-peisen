import { Alert, Link } from '@navikt/ds-react'
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { Topics } from '@/app/kafka/types.ts'
import type { DobbeltutbetalingCandidate } from '@/app/dashboard/types.ts'

type Props = {
    kandidater: DobbeltutbetalingCandidate[]
}

function investigationUrl(kandidat: DobbeltutbetalingCandidate): string {
    const params = new URLSearchParams({ topics: Topics.status, value: kandidat.behandlingId })
    return `/kafka?${params.toString()}`
}

export default function DobbeltutbetalingTable({ kandidater }: Props) {
    if (kandidater.length === 0) {
        return <Alert variant="success">Fant ingen potensielle dobbeltutbetalinger.</Alert>
    }

    return (
        <Table size="small">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>BehandlingId</TableHeaderCell>
                    <TableHeaderCell>Klassekode</TableHeaderCell>
                    <TableHeaderCell>Fom</TableHeaderCell>
                    <TableHeaderCell>Tom</TableHeaderCell>
                    <TableHeaderCell>Beløp</TableHeaderCell>
                    <TableHeaderCell>Antall kilder</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {kandidater.map((kandidat) => (
                    <TableRow key={`${kandidat.behandlingId}-${kandidat.klassekode}-${kandidat.fom}-${kandidat.tom}`}>
                        <TableDataCell>
                            <Link href={investigationUrl(kandidat)}>{kandidat.behandlingId}</Link>
                        </TableDataCell>
                        <TableDataCell>{kandidat.klassekode}</TableDataCell>
                        <TableDataCell>{kandidat.fom}</TableDataCell>
                        <TableDataCell>{kandidat.tom}</TableDataCell>
                        <TableDataCell>{kandidat.beløp.toLocaleString('nb-NO')}</TableDataCell>
                        <TableDataCell>{kandidat.kilder.length}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
