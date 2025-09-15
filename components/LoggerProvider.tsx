'use client'

import React, { ReactNode } from 'react'
import { configureLogger } from '@navikt/next-logger'

configureLogger({
    basePath: window.location.host.includes('localhost')
        ? 'http://localhost:3000'
        : window.location.host.includes('dev')
          ? 'https://peisen.intern.dev.nav.no'
          : 'https://peisen.intern.nav.no',
})

type Props = {
    children: ReactNode
}

export const LoggerProvider: React.FC<Props> = ({ children }) => {
    return children
}
