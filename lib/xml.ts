export const parsedXML = (data: string): XMLDocument => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(JSON.parse(data), 'application/xml')
    const errorNode = doc.querySelector('parsererror')

    if (errorNode) {
        throw Error('Failed to parse XML')
    }

    return doc
}
