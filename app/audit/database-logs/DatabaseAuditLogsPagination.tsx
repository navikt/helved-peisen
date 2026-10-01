'use client'

import type React from 'react'
import { HStack, Pagination, TextField } from '@navikt/ds-react'

type Props = {
    entryCount: number
    page: number
    pageCount: number
    pageSize: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
}

export const DatabaseAuditLogsPagination = ({
    entryCount,
    page,
    pageCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
}: Props) => {
    const start = (page - 1) * pageSize
    const end = start + entryCount

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value)
        if (Number.isInteger(value) && value > 0) {
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
