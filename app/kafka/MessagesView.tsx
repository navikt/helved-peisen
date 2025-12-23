'use client'

import { useContext } from 'react'
import { Alert } from '@navikt/ds-react'

import { MessagesChart, MessagesChartSkeleton } from '@/app/kafka/chart/MessagesChart.tsx'
import { MessagesTable, MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { NoMessages } from '@/app/kafka/NoMessages.tsx'
import { parsedXML } from '@/lib/xml.ts'
import { FiltereContext } from '@/app/kafka/Filtere.tsx'
import { SortStateContext } from '@/app/kafka/table/SortState.tsx'
import { keepLatest } from '@/lib/message.ts'
import { MessagesContext } from './context/MessagesContext.tsx'

export const MessagesView = () => {
    const { messages } = useContext(MessagesContext)
    const sortState = useContext(SortStateContext)
    const filtere = useContext(FiltereContext)

    if (!messages) {
        return (
            <>
                <MessagesChartSkeleton />
                <MessagesTableSkeleton />
            </>
        )
    }

    if (messages.error) {
        return (
            <Alert variant="error" role="alert">
                {messages.error.message}
            </Alert>
        )
    }

    if (Object.values(messages.data).flat().length === 0) {
        return <NoMessages />
    }

    const status = filtere.status ? filtere.status.split(',') : null

    let filteredMessages = Object.values(messages.data)
        .flat()
        .filter((it) => (status ? it.status && status.includes(it.status) : true))

    if (filtere.visning === 'siste' || filtere.utenKvittering) {
        filteredMessages = keepLatest(filteredMessages)
    }

    if (filtere.utenKvittering) {
        filteredMessages = filteredMessages.filter((m) => {
            if (!m.value || m.topic_name !== 'helved.oppdrag.v1') return false
            const doc = parsedXML(m.value)
            const alvorlighetsgrad = doc.querySelector('mmel > alvorlighetsgrad')?.textContent
            return !alvorlighetsgrad
        })
    }

    filteredMessages = filteredMessages.slice(0).sort((a, b) =>
        sortState.direction === 'ascending'
            ? // @ts-ignore
              +a[sortState.orderBy]! - +b[sortState.orderBy]!
            : sortState.direction === 'none'
              ? 0
              : // @ts-ignore
                +b[sortState.orderBy]! - +a[sortState.orderBy]!
    )

    return (
        <>
            <MessagesChart messages={filteredMessages} />
            <MessagesTable messages={filteredMessages} />
        </>
    )
}
