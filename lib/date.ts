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
