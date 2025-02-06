import { useLayoutEffect, useState } from "react"
import { ThemeProps } from "@navikt/ds-react"

export const useTheme = () => {
    const [theme, setTheme] = useState<ThemeProps["theme"]>()

    useLayoutEffect(() => {
        const toggleColorScheme = (event: MediaQueryListEvent) => {
            setTheme(event.matches ? "dark" : "light")
        }

        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", toggleColorScheme)

        const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"

        setTheme(theme)

        return () => {
            window
                .matchMedia("(prefers-color-scheme: dark)")
                .removeEventListener("change", toggleColorScheme)
        }
    }, [])

    return theme
}
