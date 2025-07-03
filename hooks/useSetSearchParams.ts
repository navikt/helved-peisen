import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export const useSetSearchParams = () => {
    const router = useRouter()

    return useCallback(
        (values: Record<string, string>) => {
            const params = new URLSearchParams(window.location.search)

            for (const [key, value] of Object.entries(values)) {
                if (value.length === 0) {
                    params.delete(key)
                } else {
                    params.set(key, value)
                }
            }

            router.push(
                window.location.pathname +
                    '?' +
                    decodeURIComponent(params.toString())
            )
        },
        [router]
    )
}
