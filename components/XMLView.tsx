'use client'

import React, { useMemo } from 'react'

import styles from './XMLView.module.css'
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
        <span className={styles.value}>{node.firstChild?.nodeValue}</span>
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
                    {attribute.nodeName}=&#34;{attribute.nodeValue}&#34;
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

export const XMLView: React.FC<Props> = ({ data }) => {
    const parsedData = useParsedXML(data)

    if (typeof parsedData === 'string') {
        return (
            <>
                <Alert variant="warning">
                    Klarte ikke parse XML. Viser rå melding nedenfor.
                </Alert>
                <pre className={styles.container}>{parsedData}</pre>
            </>
        )
    }

    return (
        <pre className={styles.container}>
            {data.split('\n')[0]}
            {'\n'}
            {Array.from(parsedData.children).map((node, i) => (
                <ParentNodeView key={i} node={node} indent={0} />
            ))}
            <div className={styles.copyButtonContainer}>
                <CopyButton size="xsmall" copyText={data} />
            </div>
        </pre>
    )
}
