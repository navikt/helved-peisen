'use client'

import React, { useState } from 'react'
import { Message } from '@/app/kafka/types.ts'
import { TableDataCell, TableExpandableRow } from '@navikt/ds-react/Table'
import { ActionMenu, Alert, Button } from '@navikt/ds-react'
import { formatDate } from 'date-fns'

import { TopicNameTag } from '@/app/kafka/table/TopicNameTag.tsx'
import { MessageStatus } from '@/components/MessageStatus.tsx'
import { ActionMenuContent, ActionMenuItem, ActionMenuTrigger } from '@navikt/ds-react/ActionMenu'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import { SakLink } from '@/app/kafka/table/SakLink.tsx'
import { AddKvitteringButton } from './actionMenu/AddKvitteringButton'
import { FlyttTilUtbetalingerButton } from '@/app/kafka/table/actionMenu/FlyttTilUtbetalingerButton.tsx'
import { TombstoneUtbetalingButton } from '@/app/kafka/table/actionMenu/TombstoneUtbetalingButton.tsx'
import { ResendMessageButton } from './actionMenu/ResendMessageButton'
import { FilterLink } from '@/components/FilterLink'
import { RemigrateButton } from './actionMenu/RemigrateButton.tsx'
import { MessageView } from '@/components/MessageView.tsx'

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
            content={didOpen && <MessageView message={message} />}
        >
            <RowContents message={message} />
        </TableExpandableRow>
    )
}
