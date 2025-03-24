import { useEffect, useRef, useState } from 'react'

export const useElementHeight = () => {
    const elementRef = useRef(null)
    const [elementHeight, setelementHeight] = useState('auto')

    useEffect(() => {
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
