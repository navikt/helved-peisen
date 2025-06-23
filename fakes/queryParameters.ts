import type QueryString from 'qs'

export const parseStringQueryParam = (
    value?:
        | string
        | QueryString.ParsedQs
        | (string | QueryString.ParsedQs)[]
        | undefined
): string[] | undefined => {
    if (typeof value === 'string') {
        return value.split(',')
    } else if (
        Array.isArray(value) &&
        value.every((it) => typeof it === 'string')
    ) {
        return value
    }

    return undefined
}
