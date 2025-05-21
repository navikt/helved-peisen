import { format } from 'date-fns/format'

export const formatDate = (date: datetime): string =>
    format(new Date(date), 'yyyy-MM-dd - HH:mm:ss')

export const parseSearchParamDate = (
    searchParams: URLSearchParams,
    key: string
) => {
    return searchParams.get(key)
        ? searchParams.get(key) === 'now'
            ? new Date().toISOString()
            : searchParams.get(key)
        : null
}
