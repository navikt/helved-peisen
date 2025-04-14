import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export const useSetSearchParams = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    return useCallback(
        (values: Record<string, string>) => {
            const params = new URLSearchParams(searchParams.toString())

            for (const [key, value] of Object.entries(values)) {
                params.set(key, value)
            }

            router.push(pathname + '?' + decodeURIComponent(params.toString()))
        },
        [searchParams, router, pathname]
    )
}
