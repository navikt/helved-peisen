'use client'

import React, { useMemo } from 'react'

import { Alert, CopyButton } from '@navikt/ds-react'

const useParsedXML = (data: string): string | XMLDocument => {
    return useMemo(() => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(data, 'application/xml')
        const errorNode = doc.querySelector('parsererror')
        return errorNode ? data : doc
    }, [data])
}

type IndentProps = {
    indent: number
    indentLength?: number
}

const Indent: React.FC<IndentProps> = ({ indent, indentLength = 2 }) => {
    return Array(Math.max(indent * indentLength, 0)).fill(' ')
}

type NodeViewProps = {
    node: Element
    indent: number
}

const LeafNodeView: React.FC<NodeViewProps> = ({ node, indent }) => (
    <>
        {'\n'}
        <Indent indent={indent} />
        {'<'}
        {node.nodeName}
        {Array.from(node.attributes).map((attribute, i) => (
            <React.Fragment key={i}>
                {' '}
                {attribute.nodeName}=&#34;{attribute.nodeValue}&#34;
            </React.Fragment>
        ))}
        {'>'}
        <span className="text-(--ax-text-neutral)">{node.firstChild?.nodeValue}</span>
        {'</'}
        {node.nodeName}
        {'>'}
    </>
)

const ParentNodeView: React.FC<NodeViewProps> = ({ node, indent }) => {
    if (node.children.length === 0) {
        return <LeafNodeView node={node} indent={indent} />
    }

    return (
        <>
            {indent !== 0 && '\n'}
            <Indent indent={indent} />
            {'<'}
            {node.nodeName}
            {Array.from(node.attributes).map((attribute, i) => (
                <React.Fragment key={i}>
                    {' '}
                    <span className="text-(--ax-warning-900)">{attribute.nodeName}</span>
                    <span className="text-(--ax-text-neutral)">=</span>
                    <span className="text-(--ax-success-900)">
                        &#34;
                        {attribute.nodeValue}&#34;
                    </span>
                </React.Fragment>
            ))}
            {'>'}
            {Array.from(node.children).map((node, i) => (
                <ParentNodeView node={node} key={i} indent={indent + 1} />
            ))}
            {'\n'}
            <Indent indent={indent} />
            {'</'}
            {node.nodeName}
            {'>'}
        </>
    )
}

type Props = {
    data: string
}

const MetaTag: React.FC<Props> = ({ data }) => {
    const [openTag, content, closeTag] = [data.slice(0, 6), data.slice(6, -2), data.slice(-2)]

    return (
        <>
            <span>{openTag}</span>
            {content.split(' ').map((attribute, i, array) => {
                const [name, value] = attribute.split('=')
                return (
                    <React.Fragment key={i}>
                        <span className="text-(--ax-warning-900)">{name}</span>
                        <span className="text-(--ax-text-neutral)">=</span>
                        <span className="text-(--ax-success-900)">{value}</span>
                        {i === array.length - 1 ? '' : ' '}
                    </React.Fragment>
                )
            })}
            <span>{closeTag}</span>
        </>
    )
}

export const XMLView: React.FC<Props> = ({ data }) => {
    const parsedData = useParsedXML(data)

    if (typeof parsedData === 'string') {
        return (
            <>
                <Alert variant="warning">Klarte ikke parse XML. Viser rå melding nedenfor.</Alert>
                <pre className="relative bg-(--ax-bg-sunken) p-4 text-sm text-(--ax-warning-1000)">{parsedData}</pre>
            </>
        )
    }

    return (
        <pre className="relative bg-(--ax-bg-sunken) p-4 text-sm text-(--ax-warning-1000)">
            <MetaTag data={`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`} />
            {'\n'}
            {Array.from(parsedData.children).map((node, i) => (
                <ParentNodeView key={i} node={node} indent={0} />
            ))}
            <div className="absolute top-4 right-4">
                <CopyButton size="xsmall" copyText={data} />
            </div>
        </pre>
    )
}
