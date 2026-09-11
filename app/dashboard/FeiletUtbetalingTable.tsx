'use client'

import { formatDate } from 'date-fns'
import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react'
import { Alert, Button, Checkbox, Link, Modal, Skeleton, Textarea } from '@navikt/ds-react'
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
import { useDashboard } from '@/app/dashboard/DashboardContext.tsx'
import type { ServerActionResponse } from '@/app/kafka/table/actionMenu/types.ts'
import { showToast } from '@/lib/browser/toast.tsx'
import { useUser } from '@/app/UserProvider'

const ScrollableTable = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [edges, setEdges] = useState({ left: false, right: false })

    useEffect(() => {
        const container = scrollRef.current
        if (!container) return

        const updateEdges = () => {
            const left = container.scrollLeft > 1
            const right = container.scrollWidth - container.clientWidth - container.scrollLeft > 1
            setEdges((previous) => (previous.left === left && previous.right === right ? previous : { left, right }))
        }

        const observer = new ResizeObserver(updateEdges)
        observer.observe(container)
        if (container.firstElementChild) observer.observe(container.firstElementChild)
        container.addEventListener('scroll', updateEdges, { passive: true })
        updateEdges()

        return () => {
            observer.disconnect()
            container.removeEventListener('scroll', updateEdges)
        }
    }, [])

    return (
        <div className={`relative min-w-0 max-w-full ${className}`}>
            <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden">
                {children}
            </div>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    boxShadow:
                        [
                            edges.left && 'inset 18px 0 14px -10px var(--ax-border-accent-subtle)',
                            edges.right && 'inset -18px 0 14px -10px var(--ax-border-accent-subtle)',
                        ]
                            .filter(Boolean)
                            .join(', ') || 'none',
                }}
            />
        </div>
    )
}

const getMessageKey = (message: Message) => {
    return `${message.key}-${message.topic_name}-${message.partition}-${message.offset}`
}

const getFagsystem = (message: Message) => {
    return message.fagsystem ?? message.headers?.find((header) => header.key === 'fagsystem')?.value
}

const getMessage = (message: Message & { value: string }): string => {
    return JSON.parse(message.value).error.msg
}

const FeiletUtbetalingCells = ({ message }: { message: Message & { value: string } }) => (
    <>
        <TableDataCell>
            <TopicNameTag message={message} />
        </TableDataCell>
        <TableDataCell>{getFagsystem(message)}</TableDataCell>
        <TableDataCell>
            <Link href={`/kafka?key=${message.key}`}>{message.key}</Link>
        </TableDataCell>
        <TableDataCell>{formatDate(message.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}</TableDataCell>
        <TableDataCell>
            <div className="max-w-84 truncate">{getMessage(message)}</div>
        </TableDataCell>
    </>
)

type FeiletUtbetalingRowProps = {
    message: Message & { value: string }
    korrigering?: KorrigertFeiletUtbetaling
    checked: boolean
    onCheck: (message: Message & { value: string }) => void
}

const FeiletUtbetalingRow: React.FC<FeiletUtbetalingRowProps> = ({ message, korrigering, checked, onCheck }) => {
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
            content={didOpen && <MessageView message={message} />}
        >
            <FeiletUtbetalingCells message={message} />
            <TableDataCell>{korrigering?.reason}</TableDataCell>
            <TableDataCell>
                <Checkbox checked={checked} onChange={() => onCheck(message)} readOnly={!!korrigering} hideLabel>
                    Kvittert
                </Checkbox>
            </TableDataCell>
        </TableExpandableRow>
    )
}

type Props = {
    feiletUtbetalinger: DashboardResponse['feiletUtbetalinger']
    korrigerteFeiletUtbetalinger: DashboardResponse['korrigerteFeiletUtbetalinger']
}

export const FeiletUtbetalingTable: React.FC<Props> = ({ feiletUtbetalinger, korrigerteFeiletUtbetalinger }) => {
    const user = useUser()
    const [markerte, setMarkerte] = useState<Record<string, Message & { value: string }>>({})
    const modalRef = useRef<HTMLDialogElement>(null)
    const { refreshDashboard } = useDashboard()
    const [state, formAction, pending] = useActionState(
        async (previousState: ServerActionResponse<void>, formData: FormData) => {
            const korrigeringer = Object.values(markerte).map((message) => ({
                topic: message.topic_name,
                key: message.key,
            }))
            const result = await korrigerFeiletUtbetalingAction(korrigeringer, previousState, formData)
            if (result.status === 'success') {
                setMarkerte({})
                modalRef.current?.close()
                showToast('Markerte utbetalinger er kvittert', { variant: 'success' })
                await refreshDashboard()
            } else if (result.status === 'error') {
                showToast(result.message, { variant: 'error' })
            }
            return result
        },
        { status: 'initial' }
    )

    if (feiletUtbetalinger.length === 0) {
        return (
            <Alert className="animate-fade-in" variant="success">
                Fant ingen feilet utbetalinger
            </Alert>
        )
    }

    return (
        <ScrollableTable>
            <Table size="small" className="whitespace-nowrap">
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell>Topic</TableHeaderCell>
                        <TableHeaderCell>Fagsystem</TableHeaderCell>
                        <TableHeaderCell>Key</TableHeaderCell>
                        <TableHeaderCell>Timestamp</TableHeaderCell>
                        <TableHeaderCell>Feilmelding</TableHeaderCell>
                        <TableHeaderCell>Kvittert</TableHeaderCell>
                        <TableHeaderCell>
                            <Button
                                type="button"
                                variant="secondary"
                                size="small"
                                disabled={!user?.isAdmin || pending || Object.keys(markerte).length === 0}
                                onClick={() => modalRef.current?.showModal()}
                            >
                                Kvittér ut
                            </Button>
                            <Modal
                                ref={modalRef}
                                header={{ heading: 'Kvittér ut markerte utbetalinger', size: 'small' }}
                                className="w-max max-w-[calc(100vw-2rem)] whitespace-normal"
                            >
                                <form action={formAction}>
                                    <Modal.Body>
                                        <ScrollableTable className="mb-4">
                                            <Table size="small" className="w-auto whitespace-nowrap">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHeaderCell>Topic</TableHeaderCell>
                                                        <TableHeaderCell>Fagsystem</TableHeaderCell>
                                                        <TableHeaderCell>Key</TableHeaderCell>
                                                        <TableHeaderCell>Timestamp</TableHeaderCell>
                                                        <TableHeaderCell>Feilmelding</TableHeaderCell>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {Object.values(markerte).map((message) => (
                                                        <TableRow key={getMessageKey(message)}>
                                                            <FeiletUtbetalingCells message={message} />
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </ScrollableTable>
                                        <Textarea
                                            name="reason"
                                            label="Oppgi grunn"
                                            error={state.validation?.reason}
                                            required
                                            disabled={pending}
                                        />
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button type="submit" loading={pending} disabled={pending}>
                                            Kvittér ut
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => modalRef.current?.close()}
                                            disabled={pending}
                                        >
                                            Avbryt
                                        </Button>
                                    </Modal.Footer>
                                </form>
                            </Modal>
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
                <TableBody className="animate-fade-in">
                    {feiletUtbetalinger.map((message, i) => {
                        const korrigering = korrigerteFeiletUtbetalinger.find(
                            ({ topic, key }) => topic === message.topic_name && key === message.key
                        )

                        return (
                            <FeiletUtbetalingRow
                                key={i}
                                message={message}
                                korrigering={korrigering}
                                checked={!!korrigering || !!markerte[getMessageKey(message)]}
                                onCheck={(message) => {
                                    if (pending) return
                                    const key = getMessageKey(message)
                                    setMarkerte((prev) => {
                                        const next = { ...prev }
                                        if (next[key]) {
                                            delete next[key]
                                        } else {
                                            next[key] = message
                                        }
                                        return next
                                    })
                                }}
                            />
                        )
                    })}
                </TableBody>
            </Table>
        </ScrollableTable>
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
                    <TableHeaderCell>Feilmelding</TableHeaderCell>
                    <TableHeaderCell>Kvittert</TableHeaderCell>
                    <TableHeaderCell>
                        <Button variant="secondary" size="small" disabled>
                            Kvittér ut
                        </Button>
                    </TableHeaderCell>
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
                        <TableDataCell>
                            <Skeleton />
                        </TableDataCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
