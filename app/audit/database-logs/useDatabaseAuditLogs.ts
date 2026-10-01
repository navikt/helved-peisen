'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { DatabaseAuditLogEntry, DatabaseAuditLogPage } from '@/app/audit/database-logs/types.ts'
import type { ApiResponse } from '@/lib/api/types.ts'

type UseDatabaseAuditLogsParams = {
    fom: string
    tom: string
    pageSize: number
}

class ApiError extends Error {}

async function fetchDatabaseAuditLogs(
    fom: string,
    tom: string,
    pageSize: number,
    pageToken: string | null,
    signal?: AbortSignal
): Promise<DatabaseAuditLogPage> {
    const params = new URLSearchParams({
        fom,
        tom,
        pageSize: String(pageSize),
    })
    if (pageToken) params.set('pageToken', pageToken)

    const response = await fetch(`/api/audit-logs/database?${params}`, { signal })
    const body = (await response.json()) as ApiResponse<DatabaseAuditLogPage>
    if (body.error !== null) throw new ApiError(body.error)
    return body.data
}

export function useDatabaseAuditLogs({ fom, tom, pageSize }: UseDatabaseAuditLogsParams) {
    const [entries, setEntries] = useState<DatabaseAuditLogEntry[]>([])
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const activeRange = useRef({ fom, tom })
    const pageTokens = useRef(new Map<number, string | null>([[1, null]]))

    const load = useCallback(
        async (pageNumber: number, pageToken: string | null, pageSize: number, signal?: AbortSignal) => {
            try {
                const { fom, tom } = activeRange.current
                const data = await fetchDatabaseAuditLogs(fom, tom, pageSize, pageToken, signal)

                setError(null)
                setEntries(data.entries)
                setPage(pageNumber)
                if (data.nextPageToken) {
                    pageTokens.current.set(pageNumber + 1, data.nextPageToken)
                    setPageCount((count) => Math.max(count, pageNumber + 1))
                } else {
                    setPageCount(pageNumber)
                }
            } catch (err) {
                if (signal?.aborted) return
                setError(err instanceof ApiError ? err.message : 'Uventet feil ved henting av database-logger')
            }
        },
        []
    )

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)
        setEntries([])
        setPage(1)
        setPageCount(1)
        pageTokens.current = new Map([[1, null]])
        activeRange.current = { fom, tom: tom === 'now' ? new Date().toISOString() : tom }

        void load(1, null, pageSize, controller.signal).finally(() => {
            if (!controller.signal.aborted) setLoading(false)
        })
        return () => controller.abort()
    }, [fom, tom, pageSize, load])

    const changePage = useCallback(
        async (nextPage: number) => {
            const pageToken = pageTokens.current.get(nextPage)
            if (pageToken === undefined) return

            setLoading(true)
            await load(nextPage, pageToken, pageSize)
            setLoading(false)
        },
        [load, pageSize]
    )

    return { entries, page, pageCount, loading, error, changePage }
}
