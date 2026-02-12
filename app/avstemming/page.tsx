'use client'

import { useState } from 'react'
import { subDays, format } from 'date-fns'
import { Alert, Button, HStack, Label, TextField } from '@navikt/ds-react'
import { fetchAvstemmingDryrun } from '@/lib/io.ts'
import { AvstemmingRequest } from '@/app/avstemming/types.ts'
import { ResultTable } from '@/app/avstemming/ResultTable.tsx'
export default function AvstemmingPage() {
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loadingDryrun, setLoadingDryrun] = useState(false)
    const today = new Date()

    const [range, setRange] = useState<AvstemmingRequest>({
        today: format(today, 'yyyy-MM-dd'),
        fom: format(subDays(today, 2), "yyyy-MM-dd'T'00:00:00"),
        tom: format(subDays(today, 1), "yyyy-MM-dd'T'23:59:59"),
    })

    const handleDryrun = async () => {
        setLoadingDryrun(true)
        setError(null)
        try {
            const data = await fetchAvstemmingDryrun(range)
            setResult(data)
        } catch (e) {
            setError(`${e}`)
        } finally {
            setLoadingDryrun(false)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-8">
            <div className="flex flex-col gap-4">
                <HStack gap="space-16" justify="space-between">
                    <Label>Dryrun</Label>
                </HStack>
                <div className="flex flex-wrap gap-4 items-end">
                    <TextField
                        label="Fra"
                        type="text"
                        size="small"
                        step="1"
                        value={range.fom.slice(0, 19)}
                        onChange={(e) => setRange({ ...range, fom: e.target.value })}
                    />
                    <TextField
                        label="Til"
                        type="text"
                        size="small"
                        step="1"
                        value={range.tom.slice(0, 19)}
                        onChange={(e) => setRange({ ...range, tom: e.target.value })}
                    />
                    <Button variant="primary" size="small" onClick={handleDryrun} loading={loadingDryrun}>
                        Kjør dryrun
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="error" role="alert">
                    {error}
                </Alert>
            )}

            {result && <ResultTable json={result} />}
        </div>
    )
}