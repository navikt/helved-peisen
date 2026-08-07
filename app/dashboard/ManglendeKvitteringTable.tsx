import { Alert, Link, Skeleton } from '@navikt/ds-react'
import { Table, TableBody, TableDataCell, TableHeader, TableHeaderCell, TableRow } from '@navikt/ds-react/Table'
import { format } from 'date-fns'
import { Topics } from '@/app/kafka/types.ts'
import type { DashboardResponse } from '@/app/dashboard/types.ts'

type Props = {
    manglende: DashboardResponse['oppdragUtenKvittering']
}

function formatAge(ageMs: number): string {
    const totalMinutes = Math.floor(ageMs / 60_000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return hours > 0 ? `${hours}t ${minutes}m` : `${minutes}m`
}

export const ManglendeKvitteringTable: React.FC<Props> = ({ manglende }) => {
    if (manglende.length === 0) {
        return (
            <Alert className="animate-fade-in" variant="success">
                Ingen oppdrag mangler kvittering utover terskelen.
            </Alert>
        )
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
            <TableBody className="animate-fade-in">
                {manglende.map((message) => (
                    <TableRow key={`${message.key}-${message.trace_id}`}>
                        <TableDataCell>
                            <Link href={`/kafka?topics=${Topics.oppdrag}&key=${message.key}`}>{message.key}</Link>
                        </TableDataCell>
                        <TableDataCell>{message.fagsystem ?? '-'}</TableDataCell>
                        <TableDataCell>{message.sakId ?? '-'}</TableDataCell>
                        <TableDataCell>{format(new Date(message.system_time_ms), 'yyyy-MM-dd HH:mm')}</TableDataCell>
                        <TableDataCell>{formatAge(new Date().getTime() - message.system_time_ms)}</TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export const ManglendeKvitteringTableSkeleton = () => {
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
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
