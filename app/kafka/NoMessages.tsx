'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BodyShort, Button, Heading, VStack } from '@navikt/ds-react'

import noMessages from '@/public/404.png'

import styles from './NoMessages.module.css'
import fadeIn from '@/styles/fadeIn.module.css'
import clsx from 'clsx'

export const NoMessages = () => {
    const size = 300

    const router = useRouter()

    const resetFilters = () => {
        router.push('/')
    }

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
                width={size}
                height={size}
            />
            <VStack>
                <Heading level="2" size="large" className={styles.heading}>
                    Fant ingen meldinger
                </Heading>
                <BodyShort className={styles.text}>
                    Prøv på nytt med andre filtere.
                </BodyShort>
                <Button onClick={resetFilters} className={styles.button}>
                    Tilbakestill alle filtere
                </Button>
            </VStack>
        </VStack>
    )
}
