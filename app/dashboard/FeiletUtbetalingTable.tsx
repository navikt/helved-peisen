'use client'

import { formatDate } from 'date-fns'
import { useActionState, useEffect, useRef, useState } from 'react'
import { Alert, Button, Checkbox, Modal, Skeleton, Textarea } from '@navikt/ds-react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import type { DashboardResponse, KorrigertFeiletUtbetaling } from '@/app/dashboard/types.ts'
import { Message } from '@/app/kafka/types.ts'
import { TopicNameTag } from '@/components/TopicNameTag'
import { MessageView } from '@/components/MessageView'
import { korrigerFeiletUtbetalingAction } from '@/app/dashboard/actions.ts'
import { showToast } from '@/lib/browser/toast'
import { useDashboard } from '@/app/dashboard/DashboardContext.tsx'

const getFagsystem = (message: Message) => {
    return message.fagsystem ?? message.headers?.find((header) => header.key === 'fagsystem')?.value
}

type FeiletUtbetalingRowProps = {
    message: Message
    korrigering?: KorrigertFeiletUtbetaling
}

const FeiletUtbetalingRow: React.FC<FeiletUtbetalingRowProps> = ({ message, korrigering }) => {
    const { refreshDashboard } = useDashboard()
    const [open, setOpen] = useState(false)
    const [didOpen, setDidOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const modal = useRef<HTMLDialogElement>(null)
    const korrigerFeiletUtbetaling = korrigerFeiletUtbetalingAction.bind(null, {
        topic: message.topic_name,
        key: message.key,
    })
    const [state, formAction, pending] = useActionState(korrigerFeiletUtbetaling, { status: 'initial' })

    const toggleOpen = (open: boolean) => {
        if (!didOpen) {
            setDidOpen(true)
        }
        setOpen(open)
    }

    useEffect(() => {
        if (state.status === 'success') {
            setRefreshing(true)
            void refreshDashboard().finally(() => {
                setRefreshing(false)
                showToast(`Markerte feilet utbetaling ${message.key} som korrigert`, { variant: 'success' })
                modal.current?.close()
            })
        }
        if (state.status === 'error') {
            showToast('Klarte ikke markere feilet utbetaling som korrigert', { variant: 'error' })
            modal.current?.close()
        }
    }, [state, message.key, refreshDashboard])

    return (
        <TableExpandableRow
            open={open}
            onOpenChange={toggleOpen}
            content={didOpen && <MessageView message={message} />}
        >
            <TableDataCell>
                <TopicNameTag message={message} />
            </TableDataCell>
            <TableDataCell>{getFagsystem(message)}</TableDataCell>
            <TableDataCell>{message.key}</TableDataCell>
            <TableDataCell>{formatDate(message.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}</TableDataCell>
            <TableDataCell>{korrigering?.reason}</TableDataCell>
            <TableDataCell>
                <Checkbox
                    checked={!!korrigering}
                    onChange={() => modal.current?.showModal()}
                    readOnly={!!korrigering}
                    hideLabel
                >
                    Kvittert
                </Checkbox>
                <Modal ref={modal} header={{ heading: 'Korriger feilet utbetaling' }} width={600}>
                    <form action={formAction}>
                        <Modal.Body>
                            <Textarea name="reason" label="Oppgi grunn" error={state?.validation?.reason} />
                        </Modal.Body>
                        <Modal.Footer>
                            <Button type="submit" loading={pending || refreshing} disabled={pending || refreshing}>
                                Lagre
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    modal.current?.close()
                                }}
                                disabled={pending || refreshing}
                            >
                                Avbryt
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal>
            </TableDataCell>
        </TableExpandableRow>
    )
}

type Props = {
    feiletUtbetalinger: DashboardResponse['feiletUtbetalinger']
    korrigerteFeiletUtbetalinger: DashboardResponse['korrigerteFeiletUtbetalinger']
}

export const FeiletUtbetalingTable: React.FC<Props> = ({ feiletUtbetalinger, korrigerteFeiletUtbetalinger }) => {
    if (feiletUtbetalinger.length === 0) {
        return (
            <Alert className="animate-fade-in" variant="success">
                Fant ingen potensielle feiletUtbetalinger.
            </Alert>
        )
    }

    return (
        <Table size="small">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell>Topic</TableHeaderCell>
                    <TableHeaderCell>Fagsystem</TableHeaderCell>
                    <TableHeaderCell>Key</TableHeaderCell>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                    <TableHeaderCell>Grunn</TableHeaderCell>
                    <TableHeaderCell>Kvittert</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody className="animate-fade-in">
                {feiletUtbetalinger.map((message, i) => {
                    const korrigering = korrigerteFeiletUtbetalinger.find(
                                ({ topic, key }) => topic === message.topic_name && key === message.key
                            )

                    return <FeiletUtbetalingRow key={i} message={message} korrigering={korrigering} />
                })}
            </TableBody>
        </Table>
    )
}

export const FeiletUtbetalingTableSkeleton = () => {
    return (
        <Table size="small">
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell>Topic</TableHeaderCell>
                    <TableHeaderCell>Fagsystem</TableHeaderCell>
                    <TableHeaderCell>Key</TableHeaderCell>
                    <TableHeaderCell>Timestamp</TableHeaderCell>
                    <TableHeaderCell>Grunn</TableHeaderCell>
                    <TableHeaderCell>Kvittert</TableHeaderCell>
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
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
