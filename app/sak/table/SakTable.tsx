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
import { AddKvitteringButton } from '@/app/kafka/table/AddKvitteringButton.tsx'
import { AddOppdragButton } from '@/app/kafka/table/AddOppdragButton.tsx'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import { Message } from '@/app/kafka/types.ts'

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
                        key={it.key + it.timestamp_ms + i}
                        className={clsx(
                            'transition-[background]',
                            activeMessage === it && 'bg-(--ax-bg-neutral-moderate-hoverA)'
                        )}
                        content={<MessageTableRowContents message={it} />}
                    >
                        <TableDataCell>
                            <TopicNameTag message={it} />
                        </TableDataCell>
                        <TableDataCell className="whitespace-nowrap">
                            {format(it.timestamp_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
                        </TableDataCell>
                        <TableDataCell>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">
                                {it.key}
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
                                        <AddKvitteringButton messageValue={it.value} messageKey={it.key} />
                                        <AddOppdragButton messageValue={it.value} messageKey={it.key} />
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
                    <TableHeaderCell textSize="small">Timestamp</TableHeaderCell>
                    <TableHeaderCell textSize="small">Key</TableHeaderCell>
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
                        <TableDataCell colSpan={4}>
                            <Skeleton height={33} />
                        </TableDataCell>
                    </TableExpandableRow>
                ))}
            </TableBody>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell />
                    <TableHeaderCell textSize="small">Topic</TableHeaderCell>
                    <TableHeaderCell textSize="small">Timestamp</TableHeaderCell>
                    <TableHeaderCell textSize="small">Key</TableHeaderCell>
                    <TableHeaderCell />
                </TableRow>
            </TableHeader>
        </Table>
    )
}
