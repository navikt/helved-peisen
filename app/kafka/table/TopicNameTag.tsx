'use client'

import React from 'react'
import clsx from 'clsx'
import { Tag } from '@navikt/ds-react'

import type { Message, StatusMessageValue, UtbetalingMessageValue } from '@/app/kafka/types.ts'

import { parsedXML } from '@/lib/xml.ts'
import { variant } from '@/lib/message.ts'

import styles from './TopicNameTag.module.css'

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

    return <div className={clsx(styles.badge, content === 'DATA' && styles.success)}>{content}</div>
}

const OppdragStatusBadge: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        return null
    }

    const xmlDoc = parsedXML(message.value)
    const content = xmlDoc.querySelector('mmel > alvorlighetsgrad')?.textContent

    if (!content) {
        return null
    }

    return (
        <div className={clsx(styles.badge, content === '00' ? styles.success : styles.error)}>
            {(() => {
                switch (content) {
                    case '00':
                        return 'OK'
                    default:
                        return 'FEILET'
                }
            })()}
        </div>
    )
}

const StatusStatusBadge: React.FC<Props> = ({ message }) => {
    if (!message.value) {
        return null
    }

    let value: StatusMessageValue
    try {
        value = JSON.parse(message.value)
    } catch (e) {
        console.error(e)
        return null
    }

    return (
        <div
            className={clsx(
                styles.badge,
                value.status === 'OK' && styles.success,
                value.status === 'FEILET' && styles.error
            )}
        >
            {value.status}
        </div>
    )
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

    return <div className={clsx(styles.badge)}>DRYRUN</div>
}

const StatusBadge: React.FC<Props> = ({ message }) => {
    switch (message.topic_name) {
        case 'helved.avstemming.v1':
            return <AvstemmingStatusBadge message={message} />
        case 'helved.oppdrag.v1':
        case 'helved.kvittering.v1':
            return <OppdragStatusBadge message={message} />
        case 'helved.oppdragsdata.v1':
            break
        case 'helved.dryrun-aap.v1':
            break
        case 'helved.dryrun-tp.v1':
            break
        case 'helved.dryrun-ts.v1':
            break
        case 'helved.dryrun-dp.v1':
            break
        case 'helved.simuleringer.v1':
            break
        case 'helved.saker.v1':
            break
        case 'helved.utbetalinger.v1':
        case 'helved.utbetalinger-aap.v1':
        case 'helved.utbetalinger-dp.v1':
            return <UtbetalingStatusBadge message={message} />
        case 'teamdagpenger.utbetaling.v1':
            break
        case 'helved.status.v1':
            return <StatusStatusBadge message={message} />
    }

    return null
}

export const TopicNameTag: React.FC<Props> = ({ message }) => {
    return (
        <Tag variant={variant(message)} className={styles.tag}>
            {message.topic_name}
            <StatusBadge message={message} />
        </Tag>
    )
}
