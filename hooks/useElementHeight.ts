import { useLayoutEffect, useRef, useState } from 'react'

export const useElementHeight = () => {
    const elementRef = useRef(null)
    const [elementHeight, setelementHeight] = useState("0")

    useLayoutEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setelementHeight(`${entry.contentRect.height}px`)
            }
        })

        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return [elementRef, elementHeight] as const
}
