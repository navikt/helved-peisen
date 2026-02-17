'use client'

import Image from 'next/image'
import { BodyShort, Heading, Link, VStack } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'

import noMessages from '@/public/404.png'

type Props = {
    title: string
}

export const NoMessages: React.FC<Props> = ({ title }) => {
    const pathname = usePathname()

    return (
        <VStack className="p-6 h-full animate-fade-in" justify="center" align="center">
            <Image className="mb-8" src={noMessages.src} alt="" width={300} height={300} />
            <VStack>
                <Heading className="mb-4" level="2" size="large">
                    {title}
                </Heading>
                <BodyShort className="mb-6">Prøv på nytt med andre filtere.</BodyShort>
                <Link href={pathname}>Tilbakestill alle filtere</Link>
            </VStack>
        </VStack>
    )
}
