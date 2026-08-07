import { Alert, Link, Skeleton } from '@navikt/ds-react'
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { Topics } from '@/app/kafka/types.ts'
import type { DashboardResponse } from '@/app/dashboard/types.ts'

type Props = {
    dobbeltutbetalinger: DashboardResponse['dobbeltutbetalinger']
}

export const DobbeltutbetalingTable: React.FC<Props> = ({ dobbeltutbetalinger }) => {
    if (dobbeltutbetalinger.length === 0) {
        return (
            <Alert className="animate-fade-in" variant="success">
                Fant ingen potensielle dobbeltutbetalinger.
            </Alert>
        )
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
            <TableBody className="animate-fade-in">
                {dobbeltutbetalinger.map((kandidat) => (
                    <TableRow key={`${kandidat.behandlingId}-${kandidat.klassekode}-${kandidat.fom}-${kandidat.tom}`}>
                        <TableDataCell>
                            <Link href={`/kafka?topics=${Topics.status}&value=${kandidat.behandlingId}`}>
                                {kandidat.behandlingId}
                            </Link>
                        </TableDataCell>
                        <TableDataCell>{kandidat.klassekode}</TableDataCell>
                        <TableDataCell>{kandidat.fom}</TableDataCell>
                        <TableDataCell>{kandidat.tom}</TableDataCell>
                        <TableDataCell>{kandidat.beløp.toLocaleString('nb-NO')}</TableDataCell>
                        <TableDataCell>{Object.entries(kandidat.kilder).length}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export const DobbeltUtbetalingTableSkeleton = () => {
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
                {new Array(2).fill(0).map((_, i) => (
                    <TableRow key={i}>
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
