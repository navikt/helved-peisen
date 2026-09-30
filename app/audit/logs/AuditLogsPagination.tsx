'use client'

import type React from 'react'
import { HStack, Pagination, TextField } from '@navikt/ds-react'

import type { AuditLogEntry } from '@/app/audit/logs/types.ts'

type Props = {
    entries: AuditLogEntry[]
    page: number
    pageCount: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export const AuditLogsPagination = ({ entries, page, pageCount, pageSize, onPageChange, onPageSizeChange }: Props) => {
    const start = (page - 1) * pageSize
    const end = start + entries.length

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = +event.target.value
        if (!isNaN(value) && value > 0) {
            onPageSizeChange(value)
        }
    }

    return (
        <div className="flex items-center justify-between gap-8 py-4 px-0">
            <HStack align="center" gap="space-8">
                <Pagination page={page} onPageChange={onPageChange} count={pageCount} size="xsmall" />
                Viser logger {start + 1} - {end}
            </HStack>
            <HStack align="center" gap="space-12">
                Logger pr. side
                <TextField
                    label="Sidestørrelse"
                    hideLabel
                    size="small"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                />
            </HStack>
        </div>
    )
}
