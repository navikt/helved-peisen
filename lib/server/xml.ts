import { DOMParser } from '@xmldom/xmldom'
import { logger } from '@navikt/next-logger'

export const parsedXML = (data: string): Document => {
    const errors: string[] = []

    const parser = new DOMParser({
        errorHandler: {
            warning: (msg) => {
                logger.warn('[XML warning]', msg)
            },
            error: (msg) => {
                logger.error('[XML error]', msg)
                errors.push(msg)
            },
        },
    })

    const doc = parser.parseFromString(data, 'application/xml')
    const root = doc.documentElement

    if (!root || root.nodeName === 'parsererror' || errors.length > 0) {
        console.error('Failed to parse XML.')
        console.error('Errors:', errors)
        console.log('Raw XML:', data)
        throw new Error('Failed to parse XML')
    }

    return doc
}
