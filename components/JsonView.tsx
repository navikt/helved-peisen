import React from 'react'
import { CopyButton } from '@navikt/ds-react'
import clsx from 'clsx'

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
                    <span className="text-(--ax-warning-1000)">&#34;{key}&#34;</span>:{' '}
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
    if (json.length === 0) return '[]'

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
                return <span className="text-(--ax-brand-blue-1000)">null</span>
            }
            if (Array.isArray(json)) {
                return <JsonArrayView json={json} indent={indent - 1} />
            }
            return <JsonObjectView json={json} indent={indent + 1} />
        }
        case 'string': {
            return <span className="text-(--ax-success-900)">&#34;{json}&#34;</span>
        }
        case 'number': {
            return <span className="text-(--ax-meta-purple-1000)">{json}</span>
        }
        case 'undefined': {
            return <span className="text-(--ax-brand-blue-1000)">undefined</span>
        }
        case 'boolean': {
            return <span className="text-(--ax-brand-magenta-1000)">{json ? 'true' : 'false'}</span>
        }
    }

    return null
}

type JsonViewProps = React.HTMLAttributes<HTMLPreElement> & {
    json: ReturnType<typeof JSON.parse>
}

export const JsonView: React.FC<JsonViewProps> = ({ json, className, ...rest }) => {
    return (
        <pre className={clsx('relative bg-(--ax-bg-sunken) p-4 text-sm text-(--ax-warning-1000)', className)} {...rest}>
            <JsonTypeView json={json} indent={0} />
            <div className="absolute top-4 right-4">
                <CopyButton size="xsmall" copyText={JSON.stringify(json)} />
            </div>
        </pre>
    )
}
