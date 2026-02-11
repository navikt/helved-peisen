import { MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { Filtere } from './Filtere.tsx'

export default function Loading() {
    return (
        <section className="flex flex-col p-4">
            <Filtere className="mb-8" />
            <MessagesTableSkeleton />
        </section>
    )
}
