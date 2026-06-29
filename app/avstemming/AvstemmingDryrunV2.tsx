'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { Alert, Button, Label, TextField } from '@navikt/ds-react'
import { AvstemmingRequest, AvstemmingResponse } from '@/app/avstemming/types.ts'
import { ResultTable } from '@/app/avstemming/table/ResultTable.tsx'
import { fetchAvstemmingDryrunV2 } from './actions'
import { isSuccessResponse } from '@/lib/api/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { xmlToJson } from '@/lib/browser/xml'
import { DateRangeSelect } from '@/components/DateRangeSelect'

export function AvstemmingDryrunV2() {
    const [result, setResult] = useState<AvstemmingResponse | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const today = new Date()

    const [range, setRange] = useState<AvstemmingRequest>({
        today: format(today, 'yyyy-MM-dd'),
        fom: format(subDays(today, 2), "yyyy-MM-dd'T'00:00:00"),
        tom: format(subDays(today, 1), "yyyy-MM-dd'T'23:59:59"),
    })

    const handleDryrun = async () => {
        setLoading(true)
        setError(null)
        setResult(null)

        const res = await fetchAvstemmingDryrunV2(range)

        if (isSuccessResponse(res)) {
            const mapped = res.data.map(({ first, second }) => ({
                first,
                second: second.map(xmlToJson),
            }))
            setResult(mapped)
        } else {
            setError(res.error)
        }
        setLoading(false)
    }

    return (
        <div>
            <div className="flex flex-col gap-4">
                <Label>Dryrun</Label>
                <div className="flex flex-wrap gap-4 items-end mb-8">
                    <DateRangeSelect
                        from={range.fom}
                        to={range.tom}
                        updateFrom={(fom) => setRange({ ...range, fom })}
                        updateTo={(tom) => setRange({ ...range, tom })}
                    />
                    <Button variant="primary" size="small" onClick={handleDryrun} loading={loading}>
                        Kjør dryrun
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="error" role="alert">
                    {error}
                </Alert>
            )}

            {result && (
                <ErrorBoundary>
                    <ResultTable avstemming={result} />
                </ErrorBoundary>
            )}
        </div>
    )
}
