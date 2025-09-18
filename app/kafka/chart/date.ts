import { format } from 'date-fns/format'

export const formatDate = (date: string | Date, increment: 'days' | 'hours' | 'minutes') => {
    return increment === 'days' ? format(date, 'MM-dd') : format(date, 'MM-dd, HH:mm')
}

export const validDate = (date: Date): boolean => {
    return !isNaN(date.valueOf())
}
