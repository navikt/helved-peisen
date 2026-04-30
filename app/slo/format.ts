export function formatMetric<T>(
    value: T | null,
    formatter: (v: T) => string = (v) => String(v),
    suffix = ''
): string {
    return value === null ? '—' : `${formatter(value)}${suffix}`
}

export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`
    }
    const rounded = Math.round(seconds)
    const minutes = Math.floor(rounded / 60)
    const remainingSeconds = rounded % 60
    if (minutes < 60) {
        return `${minutes}m ${remainingSeconds}s`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
}
