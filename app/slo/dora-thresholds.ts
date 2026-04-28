export type DoraLevel = 'elite' | 'high' | 'medium' | 'low'

const HOUR = 60 * 60
const DAY = 24 * HOUR
const WEEK = 7 * DAY

export function deployFrequencyLevel(perDay: number | null): DoraLevel | null {
    if (perDay === null) return null
    if (perDay >= 1) return 'elite'
    if (perDay >= 1 / 7) return 'high'
    if (perDay >= 1 / 30) return 'medium'
    return 'low'
}

function durationLevel(seconds: number | null): DoraLevel | null {
    if (seconds === null) return null
    if (seconds < HOUR) return 'elite'
    if (seconds < DAY) return 'high'
    if (seconds < WEEK) return 'medium'
    return 'low'
}

export const leadTimeLevel = durationLevel
export const mttrLevel = durationLevel

export function changeFailureLevel(ratio: number | null): DoraLevel | null {
    if (ratio === null) return null
    if (ratio <= 0.05) return 'elite'
    if (ratio <= 0.1) return 'high'
    if (ratio <= 0.15) return 'medium'
    return 'low'
}

export function levelClassName(level: DoraLevel | null): string | undefined {
    switch (level) {
        case 'elite':
            return 'text-(--ax-text-success) font-semibold'
        case 'high':
            return 'text-(--ax-text-success-subtle)'
        case 'medium':
            return 'text-(--ax-text-warning)'
        case 'low':
            return 'text-(--ax-text-danger) font-semibold'
        default:
            return undefined
    }
}

export function levelLabel(level: DoraLevel | null): string | undefined {
    switch (level) {
        case 'elite':
            return 'Elite'
        case 'high':
            return 'High'
        case 'medium':
            return 'Medium'
        case 'low':
            return 'Low'
        default:
            return undefined
    }
}
