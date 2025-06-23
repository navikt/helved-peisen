'use client'

import { useEffect } from 'react'
import { Alert } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

type Props = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error }: Props) {
    useEffect(() => {
        logger.error(error)
    }, [error])

    return (
        <section>
            <Alert variant="error">
                Det har skjedd en feil. Prøv igjen senere
            </Alert>
        </section>
    )
}
