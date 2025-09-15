'use client'

import React, { ReactNode } from 'react'
import { configureLogger } from '@navikt/next-logger'

const basePath = () => {
    if (typeof window === 'undefined') {
        return
    }

    return window.location.host.includes('localhost')
        ? 'http://localhost:3000'
        : window.location.host.includes('dev')
          ? 'https://peisen.intern.dev.nav.no'
          : 'https://peisen.intern.nav.no'
}

configureLogger({
    basePath: basePath(),
})

type Props = {
    children: ReactNode
}

export const LoggerProvider: React.FC<Props> = ({ children }) => {
    return children
}
