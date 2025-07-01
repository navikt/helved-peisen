import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import { Alert, BoxNew, Label, Skeleton, Tag, VStack } from '@navikt/ds-react'
import { format } from 'date-fns/format'

import { variant } from '@/lib/message'
import { Message } from '@/app/kafka/types'
import { MessageTableRowContents } from '@/app/kafka/table/MessageTableRow'
import { fetchSak } from './actions'

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

type SakerTableRowContentProps = {
    sakId: string
    fagsystem: string
}

const SakerTableRowContent: React.FC<SakerTableRowContentProps> = ({
    sakId,
    fagsystem,
}) => {
    const [hendelser, setHendelser] = useState<Message[] | null>()
    const [error, setError] = useState<string | null>()

    useEffect(() => {
        fetchSak(sakId, fagsystem).then((res) => {
            if (res.error) {
                setError(res.error.message)
            } else {
                setHendelser(res.data)
            }
        })
    }, [sakId, fagsystem])

    if (error) {
        return <Alert variant="error">Kunne ikke hente sak: {error}</Alert>
    }

    if (!hendelser) {
        return <Skeleton />
    }

    return (
        <VStack gap="space-12">
            <Label>Hendelser</Label>
            <BoxNew borderRadius="large" background="neutral-soft" padding="4">
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
                        {hendelser.map((it) => (
                            <TableExpandableRow
                                key={it.key + it.timestamp_ms}
                                content={
                                    <MessageTableRowContents message={it} />
                                }
                            >
                                <TableDataCell>
                                    <Tag variant={variant(it)}>{type(it)}</Tag>
                                </TableDataCell>
                                <TableDataCell>
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
    )
}

type Props = {
    sakId: string
    fagsystem: string
    antallUtbetalinger: number
}

export const SakerTableRow: React.FC<Props> = ({
    sakId,
    fagsystem,
    antallUtbetalinger,
}) => {
    const [open, setOpen] = useState(false)
    const [didOpen, setDidOpen] = useState(false)

    const toggleOpen = (open: boolean) => {
        if (!didOpen) {
            setDidOpen(true)
        }
        setOpen(open)
    }

    return (
        <TableExpandableRow
            open={open}
            onOpenChange={toggleOpen}
            content={
                didOpen && (
                    <SakerTableRowContent sakId={sakId} fagsystem={fagsystem} />
                )
            }
        >
            <TableDataCell>{sakId}</TableDataCell>
            <TableDataCell>{fagsystem}</TableDataCell>
            <TableDataCell>{antallUtbetalinger}</TableDataCell>
        </TableExpandableRow>
    )
}
