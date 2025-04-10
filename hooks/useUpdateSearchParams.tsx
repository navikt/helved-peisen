import {
    ReadonlyURLSearchParams,
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation'
import { useCallback } from 'react'

const shouldUpdate = (
    searchParams: ReadonlyURLSearchParams,
    key: string,
    value: string
): boolean => {
    // Ingenting å oppdatere hvis verdien ikke finnes
    if (!searchParams.get(key) && value.length === 0) {
        return false
    }

    return searchParams.get(key) !== value
}

export const useUpdateSearchParams = (searchParamName: string) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    return useCallback(
        (query: string) => {
            if (!shouldUpdate(searchParams, searchParamName, query)) {
                return
            }

            const params = new URLSearchParams(searchParams.toString())

            if (query.length === 0) {
                params.delete(searchParamName)
            } else {
                params.set(searchParamName, query)
            }

            if (params.size === 0) {
                router.push(pathname)
            } else {
                router.push(
                    pathname + '?' + decodeURIComponent(params.toString())
                )
            }
        },
        [pathname, router, searchParamName, searchParams]
    )
}
