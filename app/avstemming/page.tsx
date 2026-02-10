'use client'

import { useState } from 'react'
import { Alert, Button, TextField } from '@navikt/ds-react'
import { fetchAvstemmingDryrun, fetchAvstemmingNextRange } from '@/lib/io.ts'
import { AvstemmingRequest } from '@/app/avstemming/types.ts'

export default function AvstemmingPage() {
    const [range, setRange] = useState<AvstemmingRequest>({ today: '', fom: '', tom: '' })
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loadingRange, setLoadingRange] = useState(false)
    const [loadingDryrun, setLoadingDryrun] = useState(false)

    const handleFetchRange = async () => {
        setLoadingRange(true)
        setError(null)
        setResult(null)
        try {
            const today = new Date().toISOString().split('T')[0]
            setRange(await fetchAvstemmingNextRange(today))
        } catch (e) {
            setError(`${e}`)
        } finally {
            setLoadingRange(false)
        }
    }

    const handleDryrun = async () => {
        setLoadingDryrun(true)
        setError(null)
        try {
            const data = await fetchAvstemmingDryrun(range)
            setResult(JSON.stringify(data, null, 2))
        } catch (e) {
            setError(`${e}`)
        } finally {
            setLoadingDryrun(false)
        }
    }


    return (
        <div className="flex flex-col gap-6 max-w-4xl p-8">
            <Button className="self-start" variant="secondary" size="small" onClick={handleFetchRange} loading={loadingRange}>
                Hent neste range
            </Button>

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4 items-end">
                    <TextField
                        label="Dato"
                        type="text"
                        size="small"
                        value={range.today}
                        onChange={(e) => setRange({ ...range, today: e.target.value })}
                    />
                    <TextField
                        label="Fra (fom)"
                        type="text"
                        size="small"
                        step="1"
                        value={range.fom.slice(0, 19)}
                        onChange={(e) => setRange({ ...range, fom: e.target.value })}
                    />
                    <TextField
                        label="Til (tom)"
                        type="text"
                        size="small"
                        step="1"
                        value={range.tom.slice(0, 19)}
                        onChange={(e) => setRange({ ...range, tom: e.target.value })}
                    />
                </div>
                <div>
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

            {result && (
                <pre className="bg-gray-50 rounded-md p-4 text-sm whitespace-pre-wrap wrap-break-word">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    )
}