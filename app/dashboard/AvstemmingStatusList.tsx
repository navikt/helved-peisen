import { Alert, Skeleton, Tag } from '@navikt/ds-react'
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { format, isValid, parse } from 'date-fns'
import type { DashboardResponse } from '@/app/dashboard/types.ts'

type Props = {
    avstemminger: DashboardResponse['avstemming']
}

function formatSisteAvstemtDato(dato?: string | null): string {
    if (!dato) return '-'
    const parsed = parse(dato, 'yyyyMMddHH', new Date())
    if (!isValid(parsed)) return dato
    return format(parsed, 'dd.MM.yyyy HH:mm')
}

export const AvstemmingStatusList: React.FC<Props> = ({ avstemminger }) => {
    if (avstemminger.length === 0) {
        return (
            <Alert className="animate-fade-in" variant="info">
                Fant ingen kjente fagsystemer å sjekke avstemming for.
            </Alert>
        )
    }

    return (
        <Table size="small">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Fagsystem</TableHeaderCell>
                    <TableHeaderCell>Avstemt i går?</TableHeaderCell>
                    <TableHeaderCell>Sist avstemt</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody className="animate-fade-in">
                {avstemminger.map((avstemming) => (
                    <TableRow key={avstemming.fagsystem}>
                        <TableDataCell>{avstemming.fagsystem}</TableDataCell>
                        <TableDataCell>
                            {avstemming.datoAvstemtFom ? (
                                <Tag variant="success" size="small">
                                    Ja
                                </Tag>
                            ) : (
                                <Tag variant="error" size="small">
                                    Nei
                                </Tag>
                            )}
                        </TableDataCell>
                        <TableDataCell>{formatSisteAvstemtDato(avstemming.sisteAvstemtDato)}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export const AvstemmingStatusListSkeleton = () => {
    return (
        <Table size="small">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Fagsystem</TableHeaderCell>
                    <TableHeaderCell>Avstemt i går?</TableHeaderCell>
                    <TableHeaderCell>Sist avstemt</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {new Array(6).fill(0).map((_, i) => (
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
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
