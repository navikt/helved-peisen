import type { Message } from '@/app/kafka/types.ts'

export function headerValue(message: Message, key: string): string | null {
    return message.headers?.find((header) => header.key === key)?.value ?? null
}
