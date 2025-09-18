export const getCSSPropertyValue = (property: string) => {
    return getComputedStyle(document.body.getElementsByTagName('main')[0]).getPropertyValue(property)
}
