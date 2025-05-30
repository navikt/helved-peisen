import { JsonView } from '@/components/JsonView.tsx'
import { Heading } from '@navikt/ds-react'

import styles from './Payload.module.css'

type Props = {
    payload: string
}

export const Payload: React.FC<Props> = ({ payload }) => {
    const json = (() => {
        try {
            return JSON.parse(payload)
        } catch (e) {
            console.error(e)
            return null
        }
    })()

    if (!json) {
        return null
    }

    return (
        <div className={styles.container}>
            <Heading level="2" size="xsmall">
                Payload
            </Heading>
            <JsonView json={json} />
        </div>
    )
}
