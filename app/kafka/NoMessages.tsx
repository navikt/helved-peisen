import Image from 'next/image'
import { BodyShort, Heading, Link, VStack } from '@navikt/ds-react'

import noMessages from '@/public/404.png'

export const NoMessages = () => {
    return (
        <VStack className="p-6 h-full animate-fade-in" justify="center" align="center">
            <Image className="mb-8" src={noMessages.src} alt="" width={300} height={300} />
            <VStack>
                <Heading className="mb-4" level="2" size="large">
                    Fant ingen meldinger
                </Heading>
                <BodyShort className="mb-6">Prøv på nytt med andre filtere.</BodyShort>
                <Link href="/kafka">Tilbakestill alle filtere</Link>
            </VStack>
        </VStack>
    )
}
