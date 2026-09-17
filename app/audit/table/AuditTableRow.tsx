'use client'

import React, { useState } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import { Link, Tag } from '@navikt/ds-react'
import { TableDataCell, TableExpandableRow } from '@navikt/ds-react/Table'

import type { Message } from '@/app/kafka/types.ts'
import { TopicNameTag } from '@/components/TopicNameTag.tsx'
import { MessageView } from '@/components/MessageView.tsx'
import { sakUrl } from '@/lib/sak-url.ts'
import { headerValue } from '@/lib/message-header.ts'

type Props = {
    message: Message
}

const RowContents: React.FC<Props> = ({ message }) => {
    const endretType = headerValue(message, 'endret-type')
    const endretAv = headerValue(message, 'endret-av')
    const aarsak = headerValue(message, 'endret-aarsak')
    const manueltEndret = headerValue(message, 'manuelt-endret')
    const tidspunkt = headerValue(message, 'endret-tidspunkt')
    const url = sakUrl(message)

    return (
        <>
            <TableDataCell style={{ width: 0 }}>
                <TopicNameTag message={message} />
            </TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                {url ? (
                    <Link href={url} target="_blank" rel="noopener noreferrer">
                        {message.key}
                    </Link>
                ) : (
                    message.key
                )}
            </TableDataCell>
            <TableDataCell>{endretType ?? '-'}</TableDataCell>
            <TableDataCell>{endretAv ?? '-'}</TableDataCell>
            <TableDataCell>{aarsak ?? '-'}</TableDataCell>
            <TableDataCell style={{ width: 0 }}>
                <Tag variant={manueltEndret === 'true' ? 'success' : 'neutral'} size="small">
                    {manueltEndret === 'true' ? 'Ja' : 'Nei'}
                </Tag>
            </TableDataCell>
            <TableDataCell>
                <span className="whitespace-nowrap">
                    {tidspunkt && isValid(parseISO(tidspunkt)) ? format(parseISO(tidspunkt), 'yyyy-MM-dd, HH:mm:ss') : (tidspunkt ?? '-')}
                </span>
            </TableDataCell>
        </>
    )
}

export const AuditTableRow: React.FC<Props> = ({ message }) => {
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
