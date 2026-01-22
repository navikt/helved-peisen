import { Filtere, FiltereProvider } from '@/app/kafka/Filtere.tsx'
import { MessagesView } from '@/app/kafka/MessagesView.tsx'
import { SortStateProvider } from './table/SortState'
import { MessagesProvider } from './context/MessagesContext.tsx'

import { checkToken, ensureValidApiToken } from '@/lib/server/auth.ts'

export default async function KafkaOverview() {
    await checkToken()
    await ensureValidApiToken()

    return (
        <section className="flex flex-col p-4">
            <MessagesProvider>
                <FiltereProvider>
                    <SortStateProvider>
                        <Filtere className="mb-8" />
                        <MessagesView />
                    </SortStateProvider>
                </FiltereProvider>
            </MessagesProvider>
        </section>
    )
}
