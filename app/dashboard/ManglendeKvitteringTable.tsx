import { Alert, Link } from '@navikt/ds-react'
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { format } from 'date-fns'
import { Topics } from '@/app/kafka/types.ts'
import type { ManglendeKvittering } from '@/app/dashboard/types.ts'

type Props = {
    manglende: ManglendeKvittering[]
}

function formatAge(ageMs: number): string {
    const totalMinutes = Math.floor(ageMs / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `${hours}t ${minutes}m` : `${minutes}m`
}

function kvitteringInvestigationUrl(m: ManglendeKvittering): string {
    const params = new URLSearchParams({ topics: Topics.oppdrag, key: m.key })
    return `/kafka?${params.toString()}`
}

export default function ManglendeKvitteringTable({ manglende }: Props) {
    if (manglende.length === 0) {
        return <Alert variant="success">Ingen oppdrag mangler kvittering utover terskelen.</Alert>
    }

    return (
        <Table size="small">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Key</TableHeaderCell>
                    <TableHeaderCell>Fagsystem</TableHeaderCell>
                    <TableHeaderCell>SakId</TableHeaderCell>
                    <TableHeaderCell>Sendt</TableHeaderCell>
                    <TableHeaderCell>Alder</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {manglende.map((m) => (
                    <TableRow key={`${m.key}-${m.traceId}`}>
                        <TableDataCell>
                            <Link href={kvitteringInvestigationUrl(m)}>{m.key}</Link>
                        </TableDataCell>
                        <TableDataCell>{m.fagsystem ?? '-'}</TableDataCell>
                        <TableDataCell>{m.sakId ?? '-'}</TableDataCell>
                        <TableDataCell>{format(new Date(m.sentAt), 'yyyy-MM-dd HH:mm')}</TableDataCell>
                        <TableDataCell>{formatAge(m.ageMs)}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
