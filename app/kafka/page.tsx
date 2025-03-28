import { checkApiToken, checkToken } from '@/lib/auth/token'
import { Filtere } from '@/app/kafka/Filtere.tsx'
import { MessagesChart } from '@/app/kafka/chart/MessagesChart.tsx'
import { MessagesTable } from '@/app/kafka/table/MessagesTable.tsx'
import { getMessagesByTopic } from '@/app/kafka/table/getMessagesByTopic.ts'

import styles from './page.module.css'

type Props = {
    searchParams: Promise<SearchParams>
}

export default async function KafkaOverview({ searchParams }: Props) {
    await checkToken()
    await checkApiToken()

    const params = await searchParams
    const messages = await getMessagesByTopic(params)

    return (
        <section className={styles.page}>
            <Filtere className={styles.filtere} />
            <MessagesChart messages={messages} searchParams={params} />
            <MessagesTable messages={messages} />
        </section>
    )
}
