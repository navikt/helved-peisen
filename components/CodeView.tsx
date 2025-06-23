import React from 'react'

import { CopyButton } from '@navikt/ds-react'

import styles from './CodeView.module.css'

type Props = {
    children: string
}

export const CodeView: React.FC<Props> = ({ children }) => {
    return (
        <pre className={styles.container}>
            {children}
            <div className={styles.copyButtonContainer}>
                <CopyButton size="xsmall" copyText={children} />
            </div>
        </pre>
    )
}
