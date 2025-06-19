'use client'

import React, { ReactNode } from 'react'
import { configureLogger } from '@navikt/next-logger'

configureLogger({
    basePath: '/',
})

type Props = {
    children: ReactNode
}

export const LoggerProvider: React.FC<Props> = ({ children }) => {
    return children
}
