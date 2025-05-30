import { CopyButton, Heading } from '@navikt/ds-react'

import styles from './Metadata.module.css'

type Props = {
    metadata: Record<string, string>
}
export const Metadata: React.FC<Props> = ({ metadata }) => {
    return (
        <ul className={styles.metadata}>
            <Heading level="2" size="xsmall" className={styles.heading}>
                Metadata
            </Heading>
            {Object.entries(metadata).map(([key, value]) => (
                <li key={key} className={styles.listItem}>
                    {key}: <CopyButton copyText={value} text={value} size="small" iconPosition="right" />
                </li>
            ))}
        </ul>
    )
}
