export const parseDateValue = (value: string) => {
    return value === 'now' ? new Date().toISOString() : value
}

export const parseSearchParamDate = (searchParams: URLSearchParams, key: string) => {
    return searchParams.get(key) ? parseDateValue(searchParams.get(key)!) : null
}
