import { Alert, Tag } from '@navikt/ds-react'
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { format, isValid, parse } from 'date-fns'
import type { AvstemmingStatus } from '@/app/dashboard/types.ts'

type Props = {
    statuser: AvstemmingStatus[]
}

function formatSisteAvstemtDato(dato: string | null): string {
    if (!dato) return '-'
    const parsed = parse(dato, 'yyyyMMddHH', new Date())
    if (!isValid(parsed)) return dato
    return format(parsed, 'dd.MM.yyyy HH:mm')
}

export default function AvstemmingStatusList({ statuser }: Props) {
    if (statuser.length === 0) {
        return <Alert variant="info">Fant ingen kjente fagsystemer å sjekke avstemming for.</Alert>
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
            <TableBody>
                {statuser.map((status) => (
                    <TableRow key={status.fagsystem}>
                        <TableDataCell>{status.fagsystem}</TableDataCell>
                        <TableDataCell>
                            {status.harKjort ? (
                                <Tag variant="success" size="small">
                                    Ja
                                </Tag>
                            ) : (
                                <Tag variant="error" size="small">
                                    Nei
                                </Tag>
                            )}
                        </TableDataCell>
                        <TableDataCell>{formatSisteAvstemtDato(status.sisteAvstemtDato)}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
