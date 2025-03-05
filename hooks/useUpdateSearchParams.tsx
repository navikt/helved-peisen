import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const useUpdateSearchParams = (searchParamName: string) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    return (query: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (query.length === 0) {
            params.delete(searchParamName)
        } else {
            params.set(searchParamName, query)
        }

        if (params.size === 0) {
            router.push(pathname)
        } else {
            router.push(pathname + '?' + decodeURIComponent(params.toString()))
        }
    }
}
