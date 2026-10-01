'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ApiResponse } from '@/lib/api/types.ts'
import type { AuditLogEntry, AuditLogPage } from '@/app/audit/logs/types.ts'

type UseAuditLogsParams = {
    fom: string
    tom: string
    pageSize: number
}

type TimeRange = { fom: string; tom: string }

function resolveTimeRange(fom: string, tom: string): TimeRange {
    return { fom, tom: tom === 'now' ? new Date().toISOString() : tom }
}

class ApiError extends Error {}

async function fetchAuditLogs(
    range: TimeRange,
    pageSize: number,
    pageToken: string | null,
    signal?: AbortSignal
): Promise<AuditLogPage> {
    const params = new URLSearchParams({ fom: range.fom, tom: range.tom, pageSize: String(pageSize) })
    if (pageToken) params.set('pageToken', pageToken)

    const response = await fetch(`/api/audit-logs?${params}`, { signal })
    const body = (await response.json()) as ApiResponse<AuditLogPage>
    if (body.error !== null) throw new ApiError(body.error)
    return body.data
}

export function useAuditLogs({ fom, tom, pageSize }: UseAuditLogsParams) {
    const [entries, setEntries] = useState<AuditLogEntry[]>([])
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(1)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const activeRange = useRef<TimeRange>(resolveTimeRange(fom, tom))
    const pageTokens = useRef(new Map<number, string | null>([[1, null]]))

    const load = useCallback(
        async (pageNumber: number, pageToken: string | null, pageSize: number, signal?: AbortSignal) => {
            try {
                const data = await fetchAuditLogs(activeRange.current, pageSize, pageToken, signal)

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
                setError(err instanceof ApiError ? err.message : 'Uventet feil ved henting av audit-logger')
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
        activeRange.current = resolveTimeRange(fom, tom)

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
