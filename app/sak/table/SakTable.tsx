import React from 'react'
import {
    Table,
    TableBody,
    TableDataCell,
    TableExpandableRow,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import clsx from 'clsx'
import { MessageTableRowContents } from '@/app/kafka/table/MessageTableRow.tsx'
import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { format } from 'date-fns/format'
import { ActionMenu, Button, Skeleton } from '@navikt/ds-react'
import { ActionMenuContent, ActionMenuItem, ActionMenuTrigger } from '@navikt/ds-react/ActionMenu'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { AddKvitteringButton } from '@/app/kafka/table/actionMenu/AddKvitteringButton.tsx'
import { AddOppdragButton } from '@/app/kafka/table/actionMenu/AddOppdragButton.tsx'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import { type Message } from '@/app/kafka/types.ts'
import { FlyttTilUtbetalingerButton } from '@/app/kafka/table/actionMenu/FlyttTilUtbetalingerButton.tsx'
import { EditAndSendOppdragButton } from '@/app/kafka/table/actionMenu/EditAndSendOppdragButton.tsx'
import { TombstoneUtbetalingButton } from '@/app/kafka/table/actionMenu/TombstoneUtbetalingButton.tsx'
import { ResendDagpengerButton } from '@/app/kafka/table/actionMenu/ResendDagpengerButton.tsx'
import { MessageStatus } from '@/components/MessageStatus'

type Props = {
    messages: Message[]
    activeMessage?: Message | null
}

export const SakTable: React.FC<Props> = ({ messages, activeMessage }) => {
    return (
        <Table className="overflow-scroll" size="small">
            <TableBody>
                {messages.map((it, i) => (
                    <TableExpandableRow
                        key={it.key + it.system_time_ms + it.topic_name + i}
                        className={clsx(
                            'transition-[background]',
                            activeMessage === it && 'bg-(--ax-bg-neutral-moderate-hoverA)'
                        )}
                        content={<MessageTableRowContents message={it} />}
                    >
                        <TableDataCell style={{ width: 0 }}>
                            <TopicNameTag message={it} />
                        </TableDataCell>
                        <TableDataCell style={{ width: 0 }}>
                            <MessageStatus message={it} />
                        </TableDataCell>
                        <TableDataCell style={{ width: 0 }}>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[600px]">
                                {it.key}
                            </div>
                        </TableDataCell>
                        <TableDataCell className="whitespace-nowrap">
                            {format(it.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
                        </TableDataCell>
                        <TableDataCell>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">
                                {it.partition}
                            </div>
                        </TableDataCell>
                        <TableDataCell>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">
                                {it.offset}
                            </div>
                        </TableDataCell>
                        <TableDataCell>
                            {it.value && (
                                <ActionMenu>
                                    <ActionMenuTrigger>
                                        <Button
                                            variant="tertiary-neutral"
                                            size="small"
                                            icon={<MenuElipsisVerticalIcon title="Kontekstmeny" />}
                                        />
                                    </ActionMenuTrigger>
                                    <ActionMenuContent>
                                        {it.topic_name === 'helved.oppdrag.v1' && (
                                            <>
                                                <AddKvitteringButton messageValue={it.value} messageKey={it.key} />
                                                <AddOppdragButton messageValue={it.value} messageKey={it.key} />
                                                <EditAndSendOppdragButton messageValue={it.value} messageKey={it.key} />
                                            </>
                                        )}
                                        {it.topic_name === 'helved.pending-utbetalinger.v1' && (
                                            <>
                                                <FlyttTilUtbetalingerButton
                                                    messageValue={it.value}
                                                    messageKey={it.key}
                                                />
                                            </>
                                        )}
                                        {it.topic_name === 'helved.utbetalinger.v1' && (
                                            <TombstoneUtbetalingButton messageKey={it.key} />
                                        )}
                                        {(it.topic_name === 'teamdagpenger.utbetaling.v1' ||
                                            it.topic_name === 'helved.utbetalinger-dp.v1') && (
                                            <ResendDagpengerButton messageValue={it.value} messageKey={it.key} />
                                        )}
                                        <ActionMenuItem>
                                            <GrafanaTraceLink traceId={it.trace_id} />
                                        </ActionMenuItem>
                                    </ActionMenuContent>
                                </ActionMenu>
                            )}
                        </TableDataCell>
                    </TableExpandableRow>
                ))}
            </TableBody>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                    <TableHeaderCell textSize="small">Status</TableHeaderCell>
                    <TableHeaderCell textSize="small">Key</TableHeaderCell>
                    <TableHeaderCell textSize="small">Timestamp</TableHeaderCell>
                    <TableHeaderCell textSize="small">Partition</TableHeaderCell>
                    <TableHeaderCell textSize="small">Offset</TableHeaderCell>
                    <TableHeaderCell />
                </TableRow>
            </TableHeader>
        </Table>
    )
}

export const SakTableSkeleton = () => {
    return (
        <Table className="overflow-scroll" size="small">
            <TableBody>
                {new Array(20).fill(null).map((_, i) => (
                    <TableExpandableRow key={i} content={undefined}>
                        <TableDataCell colSpan={7}>
                            <Skeleton height={33} />
                        </TableDataCell>
                    </TableExpandableRow>
                ))}
            </TableBody>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                    <TableHeaderCell textSize="small">Status</TableHeaderCell>
                    <TableHeaderCell textSize="small">Key</TableHeaderCell>
                    <TableHeaderCell textSize="small">Timestamp</TableHeaderCell>
                    <TableHeaderCell textSize="small">Partition</TableHeaderCell>
                    <TableHeaderCell textSize="small">Offset</TableHeaderCell>
                    <TableHeaderCell />
                </TableRow>
            </TableHeader>
        </Table>
    )
}
