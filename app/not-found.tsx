'use client'

import Image from 'next/image'
import { BodyShort, Heading, Link, VStack } from '@navikt/ds-react'

import noMessages from '@/public/404.png'

export default function NotFound() {
    const size = 300

    return (
        <VStack className="p-6 h-full animate-fade-in" justify="center" align="center">
            <Image className="mb-8" src={noMessages.src} alt="" width={size} height={size} />
            <VStack>
                <Heading level="2" size="large" className="mb-4">
                    Denne siden finnes ikke
                </Heading>
                <BodyShort className="mb-6">
                    Siden kan være slettet eller flyttet, eller det er en feil i lenken.
                </BodyShort>
                <Link href="/">Gå til forsiden</Link>
            </VStack>
        </VStack>
    )
}
