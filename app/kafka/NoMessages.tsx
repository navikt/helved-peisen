import clsx from 'clsx'
import Image from 'next/image'
import { BodyShort, Heading, Link, VStack } from '@navikt/ds-react'

import noMessages from '@/public/404.png'

import styles from './NoMessages.module.css'
import fadeIn from '@/styles/fadeIn.module.css'

export const NoMessages = () => {
    return (
        <VStack
            className={clsx(styles.container, fadeIn.animation)}
            justify="center"
            align="center"
        >
            <Image
                className={styles.image}
                src={noMessages.src}
                alt=""
                width={300}
                height={300}
            />
            <VStack>
                <Heading level="2" size="large" className={styles.heading}>
                    Fant ingen meldinger
                </Heading>
                <BodyShort className={styles.text}>
                    Prøv på nytt med andre filtere.
                </BodyShort>
                <Link href="/kafka">Tilbakestill alle filtere</Link>
            </VStack>
        </VStack>
    )
}
