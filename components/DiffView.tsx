import { forwardRef } from 'react'
import clsx from 'clsx'

type DiffPart = {
    value: string
    added?: boolean
    removed?: boolean
}

/**
 * Computes a line-based diff between two texts using the classic LCS
 * (longest common subsequence) algorithm, and groups the result into
 * unified-diff-style parts (mirroring the shape used by e.g. jsdiff's
 * `diffLines`), so we avoid pulling in an external diff dependency.
 */
function diffLines(original: string, updated: string): DiffPart[] {
    const oldLines = original.split('\n')
    const newLines = updated.split('\n')
    const n = oldLines.length
    const m = newLines.length

    // dp[i][j] = length of LCS of oldLines[i..] and newLines[j..]
    const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            dp[i][j] =
                oldLines[i] === newLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
        }
    }

    type Op = { type: 'equal' | 'added' | 'removed'; line: string }
    const ops: Op[] = []
    let i = 0
    let j = 0
    while (i < n && j < m) {
        if (oldLines[i] === newLines[j]) {
            ops.push({ type: 'equal', line: oldLines[i] })
            i++
            j++
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
            ops.push({ type: 'removed', line: oldLines[i] })
            i++
        } else {
            ops.push({ type: 'added', line: newLines[j] })
            j++
        }
    }
    while (i < n) {
        ops.push({ type: 'removed', line: oldLines[i] })
        i++
    }
    while (j < m) {
        ops.push({ type: 'added', line: newLines[j] })
        j++
    }

    // Group consecutive ops of the same type into parts
    const parts: DiffPart[] = []
    for (const op of ops) {
        const last = parts[parts.length - 1]
        const isSameType =
            last && ((op.type === 'equal' && !last.added && !last.removed) || (op.type === 'added' && last.added) || (op.type === 'removed' && last.removed))

        if (isSameType) {
            last.value += `\n${op.line}`
        } else {
            parts.push({
                value: op.line,
                added: op.type === 'added' || undefined,
                removed: op.type === 'removed' || undefined,
            })
        }
    }

    return parts
}

type Props = {
    original: string
    updated: string
    className?: string
    style?: React.CSSProperties
    onScroll?: React.UIEventHandler<HTMLPreElement>
}

/**
 * Renders a unified line-diff (git-style) between two text blobs.
 */
export const DiffView = forwardRef<HTMLPreElement, Props>(({ original, updated, className, style, onScroll }, ref) => {
    const parts = diffLines(original, updated)

    return (
        <pre
            ref={ref}
            onScroll={onScroll}
            style={style}
            className={clsx(
                'whitespace-pre-wrap break-words bg-(--ax-bg-sunken) p-4 text-sm font-mono overflow-auto',
                className
            )}
        >
            {parts.map((part, i) => (
                <span
                    key={i}
                    className={clsx(
                        'block',
                        part.added && 'bg-(--ax-bg-success-soft) text-(--ax-text-success)',
                        part.removed && 'bg-(--ax-bg-danger-soft) text-(--ax-text-danger)'
                    )}
                >
                    {part.value.split('\n').map((line, lineIdx) => (
                        <span key={lineIdx} className="block">
                            {part.added ? '+ ' : part.removed ? '- ' : '  '}
                            {line}
                        </span>
                    ))}
                </span>
            ))}
        </pre>
    )
})

DiffView.displayName = 'DiffView'
