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

export function xmlToJson(xml: string): ReturnType<JSON['parse']> {
    const doc = parsedXML(xml)
    return elementToJson(doc.documentElement)
}

function elementToJson(element: Element): ReturnType<JSON['parse']> {
    const result: Record<string, unknown> = {}

    if (element.attributes.length > 0) {
        result['@attributes'] = {}

        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i]
            ;(result['@attributes'] as Record<string, string>)[attr.name] = attr.value
        }
    }

    const childElements = Array.from(element.childNodes).filter(
        (node): node is Element => node.nodeType === 1
    )

    if (childElements.length === 0) {
        const text = element.textContent?.trim()

        if (Object.keys(result).length === 0) {
            return text ?? ''
        }

        if (text) {
            result['#text'] = text
        }

        return result
    }

    for (const child of childElements) {
        const childJson = elementToJson(child)

        if (result[child.tagName] === undefined) {
            result[child.tagName] = childJson
        } else if (Array.isArray(result[child.tagName])) {
            ;(result[child.tagName] as unknown[]).push(childJson)
        } else {
            result[child.tagName] = [result[child.tagName], childJson]
        }
    }

    return result
}
