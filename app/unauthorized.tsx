'use client'

import { Alert, Link } from '@navikt/ds-react'

import styles from './layout.module.css'

export default function Unauthorized() {
    return (
        <section className={styles.section}>
            <Alert variant="error">
                Du må logge inn for å se dette innholdet
            </Alert>
            <Link href="/oauth2/login">Prøv å logge inn på nytt</Link>
        </section>
    )
}
