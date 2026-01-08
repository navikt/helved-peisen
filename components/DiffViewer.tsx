import clsx from 'clsx'

export const DiffViewer = ({ original, edited }: { original: string; edited: string }) => {
    const originalLines = original.split('\n')
    const editedLines = edited.split('\n')

    let blankLines = 0

    return (
        <div className="grid grid-cols-2 gap-2 border border-(--ax-border-neutral-subtle) rounded overflow-hidden">
            <div className="border-r border-(--ax-border-neutral-subtle)">
                <div className="px-4 py-2 font-semibold text-sm border-b border-(--ax-border-neutral-subtle)">
                    Original XML
                </div>
                <div className="overflow-auto max-h-[600px]">
                    {originalLines.map((line, i) => (
                        <div
                            key={i}
                            className="px-4 py-1 text-xs font-mono border-b border-(--ax-border-neutral-subtle)"
                        >
                            <span className="mr-4 select-none inline-block w-8 text-right">{i + 1}</span>
                            <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="px-4 py-2 font-semibold text-sm border-b border-(--ax-border-neutral-subtle)">
                    Redigert XML
                </div>
                <div className="overflow-auto max-h-[600px]">
                    {editedLines.map((line, i) => {
                        const isChanged = originalLines[i - blankLines] !== line

                        if (line === '') {
                            blankLines++
                        }

                        return (
                            <div
                                key={i}
                                className={clsx(
                                    'px-4 py-1 text-xs font-mono border-b border-(--ax-border-neutral-subtle)',
                                    isChanged && 'bg-(--ax-bg-warning-moderate) font-semibold'
                                )}
                            >
                                <span className="mr-4 select-none inline-block w-8 text-right">{i + 1}</span>
                                <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
