import { type ParsedQs } from 'qs'

export const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

export const parseStringQueryParam = (value?: string | ParsedQs | (string | ParsedQs)[]): string[] | undefined =>
    typeof value === 'string'
        ? value.split(',')
        : Array.isArray(value) && value.every((it) => typeof it === 'string')
          ? value
          : undefined
