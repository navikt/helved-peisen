export const parseDateValue = (value: string) => {
    return value === 'now' ? new Date().toISOString() : value
}
