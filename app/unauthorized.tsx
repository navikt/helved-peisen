'use client'

import { useEffect } from 'react'
import { Alert, BodyShort, Link, VStack } from '@navikt/ds-react'

import { CodeView } from '@/components/CodeView'
import { isLocal } from '@/lib/env'
import { deleteApiToken } from './actions'

function LocalUnauthorized() {
    useEffect(() => {
        deleteApiToken()
    }, [])

    return (
        <section className="flex flex-col gap-8">
            <Alert variant="error">Du må logge inn for å se dette innholdet</Alert>
            <VStack gap="space-12">
                <BodyShort>Logg inn på nytt ved å kjøre:</BodyShort>
                <CodeView>pnpm run fetch-dev-api-token</CodeView>
            </VStack>
        </section>
    )
}

export default function Unauthorized() {
    if (isLocal) {
        return <LocalUnauthorized />
    }
    return (
        <section className="flex flex-col gap-8">
            <Alert variant="error">Du må logge inn for å se dette innholdet</Alert>
            <Link href="/oauth2/login">Prøv å logge inn på nytt</Link>
        </section>
    )
}
