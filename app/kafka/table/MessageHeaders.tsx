import { Message, RawMessage } from '@/app/kafka/types.ts'
import { Card } from '@/components/Card'
import { HStack, Label, VStack } from '@navikt/ds-react'
import { capitalize } from '@/lib/string.ts'
import { format } from 'date-fns'

type Props = {
    message: RawMessage & Message
}

function formatHeaderValue(key: string, value: string): string {
    switch (key) {
        case 'x-ts':
        case 'x-st':
        case 'x-sy':
            return format(new Date(Number(value)), 'yyyy-MM-dd - HH:mm:ss.SSS')
        default:
            return value
    }
}
function headerLabel(key: string): string {
    switch (key) {
        case 'x-ts': return 'Timestamp'
        case 'x-st': return 'Stream time'
        case 'x-sy': return 'System time'
        default: return capitalize(key)
    }
}

export const MessageHeaders = ({ message }: Props) => {
    const headers = message.headers?.filter((header) => header.value)
    if (!headers?.length) return null

    return (
        <VStack gap="space-12">
            <Label>Headers</Label>
            <HStack gap="space-12">
                {headers.map((header) => (
                    <Card key={header.key} label={headerLabel(header.key)}>
                        {formatHeaderValue(header.key, header.value!)}
                    </Card>
                ))}
            </HStack>
        </VStack>
    )
}
