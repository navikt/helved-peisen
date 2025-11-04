'use client'

export const DiffViewer = ({ original, edited }: { original: string; edited: string }) => {
    const originalLines = original.split('\n')
    const editedLines = edited.split('\n')

    return (
        <div className="grid grid-cols-2 gap-2 border rounded overflow-hidden">
            <div className="border-r">
                <div className="px-4 py-2 font-semibold text-sm border-b">
                    Original XML
                </div>
                <div className="overflow-auto max-h-[600px]">
                    {originalLines.map((line, index) => (
                        <div
                            key={`original-${index}`}
                            className="px-4 py-1 text-xs font-mono border-b border-gray-100"
                        >
                            <span className="mr-4 select-none inline-block w-8 text-right">
                                {index + 1}
                            </span>
                            <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="px-4 py-2 font-semibold text-sm border-b">
                    Redigert XML
                </div>
                <div className="overflow-auto max-h-[600px]">
                    {editedLines.map((line, index) => {
                        const isChanged = originalLines[index] !== line

                        return (
                            <div
                                key={`edited-${index}`}
                                className={`px-4 py-1 text-xs font-mono border-b border-gray-100 ${
                                    isChanged ? 'bg-blue-400 font-semibold' : ''
                                }`}
                            >
                                <span className="mr-4 select-none inline-block w-8 text-right">
                                    {index + 1}
                                </span>
                                <span className="whitespace-pre-wrap break-all">{line || ' '}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
