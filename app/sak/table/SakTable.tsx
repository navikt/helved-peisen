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
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import { type Message } from '@/app/kafka/types.ts'
import { FlyttTilUtbetalingerButton } from '@/app/kafka/table/actionMenu/FlyttTilUtbetalingerButton.tsx'
import { TombstoneUtbetalingButton } from '@/app/kafka/table/actionMenu/TombstoneUtbetalingButton.tsx'
import { MessageStatus } from '@/components/MessageStatus'
import { ResendMessageButton } from '@/app/kafka/table/actionMenu/ResendMessageButton.tsx'

type Props = {
    messages: Message[]
    activeMessage?: Message | null
}

export const SakTable: React.FC<Props> = ({ messages, activeMessage }) => {
    return (
        <Table className="overflow-scroll" size="small">
            <TableBody>
                {messages.map((message, i) => (
                    <TableExpandableRow
                        key={message.key + message.system_time_ms + message.topic_name + i}
                        className={clsx(
                            'transition-[background]',
                            activeMessage === message && 'bg-(--ax-bg-neutral-moderate-hoverA)'
                        )}
                        content={<MessageTableRowContents message={message} />}
                    >
                        <TableDataCell style={{ width: 0 }}>
                            <TopicNameTag message={message} />
                        </TableDataCell>
                        <TableDataCell style={{ width: 0 }}>
                            <MessageStatus message={message} />
                        </TableDataCell>
                        <TableDataCell style={{ width: 0 }}>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[600px]">
                                {message.key}
                            </div>
                        </TableDataCell>
                        <TableDataCell className="whitespace-nowrap">
                            {format(message.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
                        </TableDataCell>
                        <TableDataCell>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">
                                {message.partition}
                            </div>
                        </TableDataCell>
                        <TableDataCell>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">
                                {message.offset}
                            </div>
                        </TableDataCell>
                        <TableDataCell>
                            <ActionMenu>
                                <ActionMenuTrigger>
                                    <Button
                                        variant="tertiary-neutral"
                                        size="small"
                                        icon={<MenuElipsisVerticalIcon title="Kontekstmeny" />}
                                    />
                                </ActionMenuTrigger>
                                <ActionMenuContent>
                                    {message.topic_name === 'helved.oppdrag.v1' && (
                                        <>
                                            <AddKvitteringButton message={message} />
                                            <ResendMessageButton
                                                message={message}
                                                label="Bygg og send oppdrag på nytt"
                                            />
                                        </>
                                    )}
                                    {message.topic_name === 'helved.pending-utbetalinger.v1' && (
                                        <FlyttTilUtbetalingerButton message={message} />
                                    )}
                                    {message.topic_name === 'helved.utbetalinger.v1' && (
                                        <TombstoneUtbetalingButton messageKey={message.key} />
                                    )}
                                    {message.topic_name === 'teamdagpenger.utbetaling.v1' && (
                                        <ResendMessageButton
                                            message={message}
                                            label="Send inn dagpengeutbetaling på nytt"
                                        />
                                    )}
                                    {message.topic_name === 'tilleggsstonader.utbetaling.v1' && (
                                        <ResendMessageButton
                                            message={message}
                                            label="Send inn tilleggsstønaderutbetaling på nytt"
                                        />
                                    )}
                                    <ActionMenuItem>
                                        <GrafanaTraceLink traceId={message.trace_id} />
                                    </ActionMenuItem>
                                </ActionMenuContent>
                            </ActionMenu>
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
