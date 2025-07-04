import React from 'react'
import { CopyButton } from '@navikt/ds-react'
import clsx from 'clsx'

import styles from './JsonView.module.css'

type IndentProps = {
    indent: number
    indentLength?: number
}

const Indent: React.FC<IndentProps> = ({ indent, indentLength = 2 }) => {
    return Array(Math.max(indent * indentLength, 0)).fill(' ')
}

type JsonObjectViewProps = {
    json: object
    indent: number
}

const JsonObjectView: React.FC<JsonObjectViewProps> = ({ json, indent }) => {
    if (!json) {
        return 'null'
    }
    return (
        <>
            {'{\n'}
            {Object.entries(json).map(([key, value], i, array) => (
                <span key={key}>
                    <Indent indent={indent} />
                    <span className={styles.key}>&#34;{key}&#34;</span>:{' '}
                    <JsonTypeView json={value} indent={indent + 1} />
                    {i < array.length - 1 && ',\n'}
                </span>
            ))}
            {'\n'}
            <Indent indent={indent - 1} />
            {'}'}
        </>
    )
}

type JsonArrayViewProps = {
    json: JsonTypeViewProps['json'][]
    indent: number
}

const JsonArrayView: React.FC<JsonArrayViewProps> = ({ json, indent }) => {
    return (
        <>
            {'[\n'}
            {json.map((it, i) => (
                <React.Fragment key={i}>
                    <Indent indent={indent + 1} />
                    <JsonTypeView json={it} indent={indent + 1} />
                    {i !== json.length - 1 && ',\n'}
                </React.Fragment>
            ))}
            {'\n'}
            <Indent indent={indent} />
            {']'}
        </>
    )
}

type JsonTypeViewProps = {
    json: ReturnType<typeof JSON.parse>
    indent: number
}

const JsonTypeView: React.FC<JsonTypeViewProps> = ({ json, indent }) => {
    switch (typeof json) {
        case 'object': {
            if (json === null) {
                return <span className={styles.nullish}>null</span>
            }
            if (Array.isArray(json)) {
                return <JsonArrayView json={json} indent={indent - 1} />
            }
            return <JsonObjectView json={json} indent={indent + 1} />
        }
        case 'string': {
            return <span className={styles.string}>&#34;{json}&#34;</span>
        }
        case 'number': {
            return <span className={styles.number}>{json}</span>
        }
        case 'undefined': {
            return <span className={styles.nullish}>undefined</span>
        }
        case 'boolean': {
            return (
                <span className={styles.boolean}>
                    {json ? 'true' : 'false'}
                </span>
            )
        }
    }

    return null
}

type JsonViewProps = React.HTMLAttributes<HTMLPreElement> & {
    json: ReturnType<typeof JSON.parse>
}

export const JsonView: React.FC<JsonViewProps> = ({
    json,
    className,
    ...rest
}) => {
    return (
        <pre className={clsx(styles.container, className)} {...rest}>
            <JsonTypeView json={json} indent={0} />
            <div className={styles.copyButtonContainer}>
                <CopyButton size="xsmall" copyText={JSON.stringify(json)} />
            </div>
        </pre>
    )
}
