'use client'

import { useEffect } from 'react'
import { Alert } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import styles from '@/app/scheduler/page.module.css'

type Props = {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error }: Props) {
    useEffect(() => {
        logger.error(error)
    }, [error])

    return (
        <section className={styles.page}>
            <Alert className={styles.alert} variant="error">
                Det har skjedd en feil. Prøv igjen senere
            </Alert>
        </section>
    )
}
