import React from 'react'

import { CopyButton } from '@navikt/ds-react'

type Props = {
    children: string
}

export const CodeView: React.FC<Props> = ({ children }) => {
    return (
        <pre className="relative bg-(--ax-bg-sunken) p-4 text-sm text-(--ax-success-900)">
            {children}
            <div className="absolute top-4 right-4">
                <CopyButton size="xsmall" copyText={children} />
            </div>
        </pre>
    )
}
