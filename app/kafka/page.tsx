import { Filtere, FiltereProvider } from '@/app/kafka/Filtere.tsx'
import { MessagesView } from '@/app/kafka/MessagesView.tsx'
import { checkToken } from '@/lib/auth/accessToken'
import { ensureValidApiToken } from '@/lib/auth/apiToken.ts'
import { SortStateProvider } from './table/SortState'
import { MessagesProvider } from './context/MessagesContext.tsx'

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
