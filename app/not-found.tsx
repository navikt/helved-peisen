'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { BodyShort, Heading, Link, VStack } from '@navikt/ds-react'

import noMessages from '@/public/404.png'
import fadeIn from '@/styles/fadeIn.module.css'

import styles from './kafka/NoMessages.module.css'

export default function NotFound() {
    const size = 300

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
                    Denne siden finnes ikke
                </Heading>
                <BodyShort className={styles.text}>
                    Siden kan være slettet eller flyttet, eller det er en feil i
                    lenken.
                </BodyShort>
                <Link href="/">Gå til forsiden</Link>
            </VStack>
        </VStack>
    )
}
