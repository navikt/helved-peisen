export const parsedXML = (xml: string): Document => {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')

    const parserError = doc.getElementsByTagName('parsererror')[0]
    if (parserError) {
        const message = parserError.textContent ?? 'Unknown XML parse error'
        console.error('Failed to parse XML:', message)
        console.log('Raw XML:', xml)
        throw new Error(message)
    }

    return doc
}

export function xmlToJson(xml: string): ReturnType<JSON['parse']> {
    const doc = new DOMParser().parseFromString(xml, 'application/xml')

    const parseError = doc.querySelector('parsererror')
    if (parseError) {
        throw new Error('Invalid XML')
    }

    return elementToJson(doc.documentElement)
}

function elementToJson(element: Element): ReturnType<JSON['parse']> {
    const result: Record<string, unknown> = {}

    // Attributes
    if (element.attributes.length > 0) {
        result['@attributes'] = {}

        for (const attr of Array.from(element.attributes)) {
            ;(result['@attributes'] as Record<string, string>)[attr.name] = attr.value
        }
    }

    // Child elements
    const childElements = Array.from(element.children)

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
