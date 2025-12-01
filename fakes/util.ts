export const sleep = (ms: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms)
    })

export const parseStringQueryParam = (value?: any): string[] | undefined =>
    typeof value === 'string'
        ? value.split(',')
        : Array.isArray(value) && value.every((it) => typeof it === 'string')
          ? value
          : undefined
