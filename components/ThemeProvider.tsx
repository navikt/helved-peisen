'use client'

import { Theme } from '@navikt/ds-react'
import { useTheme } from '@/hooks/useTheme'

type Props = {
    children: React.ReactNode
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
    const theme = useTheme()

    if (!theme) {
        return null
    }

    return <Theme theme={theme}>{children}</Theme>
}
