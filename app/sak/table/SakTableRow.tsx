import clsx from 'clsx'
import { useState } from 'react'
import { format } from 'date-fns'
import { ActionMenu, Button } from '@navikt/ds-react'
import { MenuElipsisVerticalIcon } from '@navikt/aksel-icons'
import { TableDataCell, TableExpandableRow } from '@navikt/ds-react/Table'
import { ActionMenuContent, ActionMenuItem, ActionMenuTrigger } from '@navikt/ds-react/ActionMenu'

import { MessageTableRowContents } from '@/app/kafka/table/MessageTableRow'
import { TopicNameTag } from '@/app/kafka/table/TopicNameTag'
import { MessageStatus } from '@/components/MessageStatus'
import { AddKvitteringButton } from '@/app/kafka/table/actionMenu/AddKvitteringButton.tsx'
import { ResendMessageButton } from '@/app/kafka/table/actionMenu/ResendMessageButton.tsx'
import { FlyttTilUtbetalingerButton } from '@/app/kafka/table/actionMenu/FlyttTilUtbetalingerButton.tsx'
import { TombstoneUtbetalingButton } from '@/app/kafka/table/actionMenu/TombstoneUtbetalingButton.tsx'
import { GrafanaTraceLink } from '@/components/GrafanaTraceLink.tsx'
import type { Message } from '@/app/kafka/types.ts'
import { RemigrateButton } from '@/app/kafka/table/actionMenu/remigrate/RemigrateButton'

type Props = {
    message: Message
    active: boolean
}

export const SakTableRow: React.FC<Props> = ({ message, active }) => {
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
            className={clsx('transition-[background]', active && 'bg-(--ax-bg-neutral-moderate-hoverA)')}
            open={open}
            onOpenChange={toggleOpen}
            content={didOpen && <MessageTableRowContents message={message} />}
        >
            <TableDataCell style={{ width: 0 }}>
                <TopicNameTag message={message} />
            </TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <MessageStatus message={message} />
            </TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-150">{message.key}</div>
            </TableDataCell>
            <TableDataCell className="whitespace-nowrap">
                {format(message.system_time_ms, 'yyyy-MM-dd - HH:mm:ss.SSS')}
            </TableDataCell>
            <TableDataCell>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">{message.partition}</div>
            </TableDataCell>
            <TableDataCell>
                <div className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[320px]">{message.offset}</div>
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
        </TableExpandableRow>
    )
}
