'use client'

import React from 'react'
import { Tag, TagProps } from '@navikt/ds-react'

import type { Message, StatusMessageValue } from '@/app/kafka/types.ts'

import styles from './TopicNameTag.module.css'
import clsx from 'clsx'
import { parsedXML } from '@/lib/xml.ts'

const parser = new DOMParser()

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

    return (
        <div
            className={clsx(styles.badge, content === 'DATA' && styles.success)}
        >
            {content}
        </div>
    )
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
        <div
            className={clsx(
                styles.badge,
                content === '00' ? styles.success : styles.error
            )}
        >
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

    const value: StatusMessageValue = JSON.parse(message.value)

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
        case 'helved.utbetalinger.v1':
            break
        case 'helved.saker.v1':
            break
        case 'helved.utbetalinger-aap.v1':
            break
        case 'helved.status.v1':
            return <StatusStatusBadge message={message} />
    }

    return null
}

export const TopicNameTag: React.FC<Props> = ({ message }) => {
    const variant: TagProps['variant'] = (() => {
        switch (message.topic_name) {
            case 'helved.oppdragsdata.v1':
            case 'helved.avstemming.v1':
            case 'helved.kvittering.v1':
                return 'info'
            case 'helved.dryrun-ts.v1':
            case 'helved.dryrun-dp.v1':
            case 'helved.dryrun-tp.v1':
            case 'helved.dryrun-aap.v1':
            case 'helved.simuleringer.v1':
                return 'neutral'
            case 'helved.utbetalinger-aap.v1':
            case 'helved.utbetalinger.v1':
                return 'success'
            case 'helved.saker.v1':
                return 'alt1'
            case 'helved.oppdrag.v1':
                return 'warning'
            case 'helved.status.v1':
                return 'alt2'
        }
    })()

    return (
        <Tag variant={variant} className={styles.tag}>
            {message.topic_name}
            <StatusBadge message={message} />
        </Tag>
    )
}
