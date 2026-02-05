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
