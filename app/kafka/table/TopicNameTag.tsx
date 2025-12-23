'use client'

import React from 'react'
import clsx from 'clsx'
import { Tag } from '@navikt/ds-react'

import type { Message, UtbetalingMessageValue } from '@/app/kafka/types.ts'

import { parsedXML } from '@/lib/xml.ts'
import { variant } from '@/lib/message.ts'

type BadgeProps = {
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
    children: React.ReactNode
}

const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children }) => (
    <div
        className={clsx(
            'absolute right-0 top-0 text-xs pt-[1px] px-1 pb-0 border rounded-lg translate-x-[50%] -translate-y-[50%] leading-none',
            variant === 'neutral' && 'bg-(--ax-bg-neutral-soft) border-(--ax-border-neutral) text-(--ax-text-neutral)',
            variant === 'success' &&
                'bg-(--ax-bg-success-moderate) border-(--ax-border-success) text-(--ax-text-success)',
            variant === 'danger' && 'bg-(--ax-bg-danger-moderate) border-(--ax-border-danger) text-(--ax-text-danger)',
            variant === 'info' && 'bg-(--ax-bg-info-moderate) border-(--ax-border-info) text-(--ax-text-info)'
        )}
    >
        {children}
    </div>
)

type Props = {
    message: Message
}

const AvstemmingStatusBadge: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        return null
    }

    const xmlDoc = parsedXML(message.value)
    const content = xmlDoc.querySelector('aksjon > aksjonType')?.textContent

    if (!content) {
        return null
    }

    return <Badge variant={content === 'DATA' ? 'success' : 'neutral'}>{content}</Badge>
}

const UtbetalingStatusBadge: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        return null
    }

    let value: UtbetalingMessageValue
    try {
        value = JSON.parse(message.value)
    } catch (e) {
        console.error(e)
        return null
    }

    if (!value.dryrun) {
        return null
    }

    return <Badge>DRYRUN</Badge>
}

const StatusBadge: React.FC<Props> = ({ message }) => {
    switch (message.topic_name) {
        case 'helved.avstemming.v1':
            return <AvstemmingStatusBadge message={message} />
        case 'helved.dryrun-aap.v1':
        case 'helved.dryrun-tp.v1':
        case 'helved.dryrun-ts.v1':
        case 'helved.dryrun-dp.v1':
        case 'helved.fk.v1':
        case 'helved.simuleringer.v1':
        case 'helved.saker.v1':
            break
        case 'helved.utbetalinger.v1':
        case 'historisk.utbetaling.v1':
        case 'helved.utbetalinger-historisk.v1':
        case 'helved.pending-utbetalinger.v1':
        case 'helved.utbetalinger-aap.v1':
        case 'helved.utbetalinger-ts.v1':
        case 'helved.utbetalinger-tp.v1':
        case 'helved.utbetalinger-dp.v1':
        case 'teamdagpenger.utbetaling.v1':
        case 'tilleggsstonader.utbetaling.v1':
        case 'aap.utbetaling.v1':
            return <UtbetalingStatusBadge message={message} />
    }

    return null
}

export const TopicNameTag: React.FC<Props> = ({ message }) => {
    return (
        <Tag variant={variant(message)} size="small" className="relative whitespace-nowrap">
            {message.topic_name}
            <StatusBadge message={message} />
        </Tag>
    )
}
