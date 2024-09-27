'use client'

import { useEffect } from 'react'
import { Alert } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import styles from '@/app/page.module.css'

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
                Klarte ikke hente tasks. Prøv igjen senere
            </Alert>
        </section>
    )
}
