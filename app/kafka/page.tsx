import { Filtere, FiltereProvider } from '@/app/kafka/Filtere.tsx'
import { MessagesView } from '@/app/kafka/MessagesView.tsx'
import { SortStateProvider } from './table/SortState'
import { MessagesProvider } from './context/MessagesContext.tsx'

import { checkToken } from '@/lib/server/auth.ts'

export default async function KafkaOverview() {
    await checkToken()

    return (
        <section className="flex flex-col p-4">
            <FiltereProvider>
                <MessagesProvider>
                    <SortStateProvider>
                        <Filtere className="mb-8" />
                        <MessagesView />
                    </SortStateProvider>
                </MessagesProvider>
            </FiltereProvider>
        </section>
    )
}
