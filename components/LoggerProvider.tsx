'use client'

import React, { ReactNode } from 'react'
import { configureLogger } from '@navikt/next-logger'

configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH!,
})

type Props = {
    children: ReactNode
}

export const LoggerProvider: React.FC<Props> = ({ children }) => {
    return children
}
