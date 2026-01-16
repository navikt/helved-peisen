'use client'

import React, { useState } from 'react'
import { Message } from '@/app/kafka/types.ts'
import { TableDataCell, TableExpandableRow, TableRow } from '@navikt/ds-react/Table'
import { ActionMenu, Button, CopyButton, HStack, Label, VStack } from '@navikt/ds-react'
import { ActionMenuContent, ActionMenuItem, ActionMenuTrigger } from '@navikt/ds-react/ActionMenu'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { formatDate } from 'date-fns'

import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import { UrlSearchParamLink } from '@/components/UrlSearchParamLink.tsx'
import { AddKvitteringButton } from '@/app/kafka/table/actionMenu/AddKvitteringButton.tsx'
import { MessageMetadata } from '@/app/kafka/table/MessageMetadata.tsx'
import { MessageValue } from './MessageValue'
import { SakLink } from './SakLink'
import { FlyttTilUtbetalingerButton } from '@/app/kafka/table/actionMenu/FlyttTilUtbetalingerButton.tsx'
import { EditAndSendOppdragButton } from '@/app/kafka/table/actionMenu/EditAndSendOppdragButton.tsx'
import { TombstoneUtbetalingButton } from '@/app/kafka/table/actionMenu/TombstoneUtbetalingButton.tsx'
import { ResendDagpengerButton } from '@/app/kafka/table/actionMenu/ResendDagpengerButton.tsx'
import { MessageStatus } from '@/components/MessageStatus.tsx'
import { ResendTilleggsstonaderButton } from '@/app/kafka/table/actionMenu/ResendTilleggsstonaderButton.tsx'

type Props = {
    message: Message
}

export const MessageTableRowContents: React.FC<Props> = ({ message }) => {
    return (
        <VStack gap="space-32">
            <VStack gap="space-12">
                <Label>Key</Label>
                <HStack gap="space-8">
                    {message.key}
                    <CopyButton size="xsmall" copyText={message.key} />
                </HStack>
            </VStack>
            <MessageMetadata message={message} />
            <MessageValue message={message} />
        </VStack>
    )
}

const RowContents: React.FC<Props> = ({ message }) => {
    return (
        <>
            <TableDataCell style={{ width: 0 }}>
                <TopicNameTag message={message} />
            </TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <MessageStatus message={message} />
            </TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <UrlSearchParamLink
                    searchParamName="key"
                    searchParamValue={message.key}
                    className="max-w-[600px] text-ellipsis block whitespace-nowrap overflow-hidden"
                >
                    {message.key}
                </UrlSearchParamLink>
            </TableDataCell>
            <TableDataCell>
                <span className="whitespace-nowrap">
                    {formatDate(message.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
                </span>
            </TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
            <TableDataCell>
                {message.value && (
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
                                    <AddKvitteringButton messageValue={message.value} messageKey={message.key} />
                                    <EditAndSendOppdragButton
                                        xml={message.value}
                                        messageKey={message.key}
                                        system_time_ms={message.system_time_ms}
                                    />
                                </>
                            )}

                            {message.topic_name === 'helved.pending-utbetalinger.v1' && (
                                <>
                                    <FlyttTilUtbetalingerButton messageValue={message.value} messageKey={message.key} />
                                </>
                            )}
                            {message.topic_name === 'helved.utbetalinger.v1' && (
                                <TombstoneUtbetalingButton messageKey={message.key} />
                            )}
                            {message.topic_name === 'teamdagpenger.utbetaling.v1' && (
                                <ResendDagpengerButton messageValue={message.value} messageKey={message.key} />
                            )}
                            {message.topic_name === 'tilleggsstonader.utbetaling.v1' && (
                                <ResendTilleggsstonaderButton messageValue={message.value} messageKey={message.key} />
                            )}
                            <ActionMenuItem>
                                <GrafanaTraceLink traceId={message.trace_id} />
                            </ActionMenuItem>
                            <SakLink message={message} />
                        </ActionMenuContent>
                    </ActionMenu>
                )}
            </TableDataCell>
        </>
    )
}

const ExpandableMessageTableRow: React.FC<Props> = ({ message }) => {
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
            content={didOpen && <MessageTableRowContents message={message} />}
        >
            <RowContents message={message} />
        </TableExpandableRow>
    )
}

export const MessageTableRow: React.FC<Props> = ({ message }) => {
    if (message.value) {
        return <ExpandableMessageTableRow message={message} />
    }

    if (!message.value) {
        return (
            <TableRow>
                <TableDataCell textSize="small" />
                <RowContents message={message} />
            </TableRow>
        )
    }
}
