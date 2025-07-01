export const parsedXML = (data: string): XMLDocument => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'application/xml')
    const errorNode = doc.querySelector('parsererror')

    if (errorNode) {
        console.error(errorNode)
        console.log(data)
        throw Error('Failed to parse XML')
    }

    return doc
}
