'use client'

import React, { useEffect, useState } from 'react'
import { Message, RawMessage } from '@/app/kafka/types.ts'
import { TableDataCell, TableExpandableRow } from '@navikt/ds-react/Table'
import { ActionMenu, Alert, Button, CopyButton, HStack, Label, Skeleton, VStack } from '@navikt/ds-react'
import { formatDate } from 'date-fns'

import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { MessageMetadata } from '@/app/kafka/table/MessageMetadata.tsx'
import { MessageValue } from './MessageValue'
import { MessageStatus } from '@/components/MessageStatus.tsx'
import { ActionMenuContent, ActionMenuItem, ActionMenuTrigger } from '@navikt/ds-react/ActionMenu'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import { SakLink } from '@/app/kafka/table/SakLink.tsx'
import { AddKvitteringButton } from './actionMenu/AddKvitteringButton'
import { FlyttTilUtbetalingerButton } from '@/app/kafka/table/actionMenu/FlyttTilUtbetalingerButton.tsx'
import { TombstoneUtbetalingButton } from '@/app/kafka/table/actionMenu/TombstoneUtbetalingButton.tsx'
import { ResendMessageButton } from './actionMenu/ResendMessageButton'
import { showToast } from '@/components/Toast'
import { useUser } from '@/components/UserProvider.tsx'
import { teamLogger } from '@navikt/next-logger/team-log'
import { FilterLink } from '@/components/FilterLink'
import { RemigrateButton } from './actionMenu/RemigrateButton.tsx'
import MessageHeaders from '@/app/kafka/table/MessageHeaders.tsx'
import { fetchRawMessage } from '@/app/kafka/actions.ts'
import { isSuccessResponse } from '@/lib/api/types.ts'

const formatFagsystem = (fagsystem?: string | null) => {
    if (!fagsystem) {
        return null
    }

    switch (fagsystem) {
        case 'DP':
        case 'DAGPENGER':
            return 'DAGPENGER'
        case 'TILTPENG':
        case 'TILTAKSPENGER':
            return 'TILTAKSPENGER'
        case 'TILLEGGSSTØNADER':
        case 'TILLST':
            return 'TILLEGGSSTØNADER'
        case 'HISTORISK':
        case 'HELSREF':
            return 'HISTORISK'
        case 'AAP':
            return 'AAP'
        default: {
            if (fagsystem?.startsWith('TILLST')) {
                return 'TILLEGGSSTØNADER'
            } else {
                return <Alert variant="error">Klarte ikke formatere fagsystem: {fagsystem}</Alert>
            }
        }
    }
}

type Props = {
    message: Message
}

export const MessageTableRowContents: React.FC<Props> = ({ message }) => {
    const [rawMessage, setRawMessage] = useState<(Message & RawMessage) | null>(null)
    const [loading, setLoading] = useState(true)
    const user = useUser()

    useEffect(() => {
        setLoading(true)
        fetchRawMessage(message)
            .then((res) => {
                if (isSuccessResponse(res)) {
                    setRawMessage({ ...message, ...res.data })
                } else {
                    showToast(res.error, { variant: 'error' })
                }
            })
            .catch((e) => {
                showToast(`Klarte ikke hente melding: ${e.message}`, { variant: 'error' })
            })
            .finally(() => {
                teamLogger.info(
                    `${user?.name} (${user?.ident}) hentet melding fra topic ${message.topic_name} med partition ${message.partition}, offset ${message.offset}, og key ${message.key}`
                )
                setLoading(false)
            })
    }, [message, user])

    if (loading) {
        return <Skeleton width="100%" height="100%" />
    }

    return (
        <VStack gap="space-32">
            {rawMessage && (
                <>
                    <VStack gap="space-12">
                        <Label>Key</Label>
                        <HStack gap="space-8">
                            {rawMessage.key}
                            <CopyButton size="xsmall" copyText={rawMessage.key} />
                        </HStack>
                    </VStack>
                    <MessageHeaders message={message} />
                    <MessageMetadata message={rawMessage} />
                    <MessageValue message={rawMessage} />
                </>
            )}
        </VStack>
    )
}

const RowContents: React.FC<Props> = ({ message }) => {
    const fagsystemHeader = message.headers?.find((header) => header.key === 'fagsystem')?.value

    return (
        <>
            <TableDataCell style={{ width: 0 }}>
                <TopicNameTag message={message} />
            </TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <MessageStatus message={message} />
            </TableDataCell>
            <TableDataCell>{formatFagsystem(message.fagsystem ?? fagsystemHeader)}</TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <FilterLink
                    filter="key"
                    value={message.key}
                    className="max-w-150 text-ellipsis block whitespace-nowrap overflow-hidden cursor-pointer"
                >
                    {message.key}
                </FilterLink>
            </TableDataCell>
            <TableDataCell>
                <span className="whitespace-nowrap">
                    {formatDate(message.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
                </span>
            </TableDataCell>
            <TableDataCell>{message.partition}</TableDataCell>
            <TableDataCell>{message.offset}</TableDataCell>
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
                        <SakLink message={message} />
                        {message.topic_name === 'helved.oppdrag.v1' && (
                            <>
                                <AddKvitteringButton message={message} />
                                <ResendMessageButton message={message} label="Bygg og send oppdrag på nytt" />
                            </>
                        )}
                        {message.topic_name === 'helved.pending-utbetalinger.v1' && (
                            <FlyttTilUtbetalingerButton message={message} />
                        )}
                        {message.topic_name === 'helved.utbetalinger.v1' && (
                            <>
                                <TombstoneUtbetalingButton messageKey={message.key} />
                                <RemigrateButton message={message} />
                            </>
                        )}
                        {message.topic_name === 'teamdagpenger.utbetaling.v1' && (
                            <ResendMessageButton message={message} label="Send inn dagpengeutbetaling på nytt" />
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
        </>
    )
}

export const MessageTableRow: React.FC<Props> = ({ message }) => {
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
