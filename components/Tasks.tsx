'use client'

import { useCallback, useEffect, useState } from 'react'
import { Alert } from '@navikt/ds-react'
import {
    TaskTable,
    TaskTableSkeleton,
} from '@/components/taskTable/TaskTable.tsx'
import { Filtere } from '@/app/scheduler/Filtere.tsx'
import { Footer, FooterSkeleton } from '@/components/Footer.tsx'
import {
    TaskRefresher,
    TaskRefresherSkeleton,
} from '@/components/TaskRefresher.tsx'
import { fetchTasks, FetchTasksResponse } from '@/lib/api/tasks.ts'

import styles from './Tasks.module.css'

type Props = {
    searchParams: SearchParams
}

export const Tasks: React.FC<Props> = ({ searchParams }) => {
    const [response, setResponse] =
        useState<Awaited<FetchTasksResponse> | null>(null)

    const refreshTasks = useCallback(async () => {
        const response = await fetchTasks(searchParams)
        setResponse(response)
    }, [searchParams])

    useEffect(() => {
        fetchTasks(searchParams).then((response) => {
            setResponse(response)
        })
    }, [searchParams])

    if (!response) {
        return <TasksSkeleton />
    }

    if (response.error) {
        return (
            <Alert className={styles.alert} variant="error" role="alert">
                Klarte ikke hente tasks:
                <br />
                {response.error.statusCode} - {response.error.message}
            </Alert>
        )
    }

    if (response.data.tasks.length === 0) {
        return (
            <>
                <Filtere />
                <Alert className={styles.alert} variant="info" role="alert">
                    Fant ingen tasks med gjeldende filtere
                </Alert>
            </>
        )
    }

    return (
        <>
            <Filtere className={styles.filtere} />
            <TaskRefresher
                onRefresh={refreshTasks}
                className={styles.refresher}
            />
            <TaskTable
                className={styles.tasks}
                tasks={response.data.tasks}
                totalTasks={response.data.totalTasks}
            />
            <Footer
                className={styles.footer}
                numberOfTasks={response.data.tasks.length}
                page={response.data.page}
                pageSize={response.data.pageSize}
                totalTasks={response.data.totalTasks}
            />
        </>
    )
}

export const TasksSkeleton = () => (
    <>
        <Filtere className={styles.filtere} />
        <TaskRefresherSkeleton className={styles.refresher} />
        <TaskTableSkeleton />
        <FooterSkeleton className={styles.footer} />
    </>
)
