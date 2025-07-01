'use client'

import { useEffect, useState } from 'react'
import {
    TableBody,
    TableDataCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from '@navikt/ds-react/Table'
import {
    Alert,
    HStack,
    Pagination,
    Skeleton,
    Table,
    TextField,
    VStack,
} from '@navikt/ds-react'

import styles from './SakerTable.module.css'
import { SakerTableRow } from './SakerTableRow'
import { fetchSaker } from './actions'

type Sak = { sakId: string; antallUtbetalinger: number; fagsystem: string }

export const SakerTable: React.FC = () => {
    const [saker, setSaker] = useState<Sak[] | null>()
    const [error, setError] = useState<string | null>()
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)

    useEffect(() => {
        fetchSaker().then((res) => {
            if (res.error) {
                setError(res.error.message)
            } else {
                setSaker(res.data)
            }
        })
    }, [])

    if (error) {
        return <Alert variant="error">{error}</Alert>
    }

    if (!saker) {
        return null
    }

    const start = (page - 1) * pageSize
    const end = Math.min(start + pageSize, saker.length)
    const paginatedSaker = saker.slice(start, end)

    const onChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = Number(event.target.value)
        if (isNaN(newSize)) {
            return
        }
        setPageSize(newSize)
    }

    return (
        <VStack>
            <Table>
                <TableBody>
                    {paginatedSaker.map((it) => (
                        <SakerTableRow key={it.sakId + it.fagsystem} {...it} />
                    ))}
                </TableBody>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell />
                        <TableHeaderCell
                            className={styles.tableHeaderCell}
                            textSize="small"
                        >
                            Sak-ID
                        </TableHeaderCell>
                        <TableHeaderCell
                            className={styles.tableHeaderCell}
                            textSize="small"
                        >
                            Fagsystem
                        </TableHeaderCell>
                        <TableHeaderCell
                            className={styles.tableHeaderCell}
                            textSize="small"
                        >
                            Antall utbetalinger
                        </TableHeaderCell>
                    </TableRow>
                </TableHeader>
            </Table>
            <HStack
                className={styles.paginationContainer}
                justify="space-between"
                align="center"
            >
                <HStack align="center" gap="space-8">
                    <Pagination
                        page={page}
                        onPageChange={setPage}
                        count={Math.ceil(saker.length / pageSize)}
                        size="xsmall"
                    />
                    Viser saker {start + 1} - {end} av {saker.length}
                </HStack>
                <HStack align="center" gap="space-12">
                    Saker pr. side
                    <TextField
                        label="Sidestørrelse"
                        hideLabel
                        size="small"
                        value={pageSize}
                        onChange={onChangePageSize}
                    />
                </HStack>
            </HStack>
        </VStack>
    )
}

export const SakerTableSkeleton = () => {
    return (
        <Table>
            <TableBody>
                {Array(20)
                    .fill(null)
                    .map((_, i) => (
                        <TableRow key={i}>
                            <TableDataCell colSpan={3}>
                                <Skeleton height={33} />
                            </TableDataCell>
                        </TableRow>
                    ))}
            </TableBody>
        </Table>
    )
}
