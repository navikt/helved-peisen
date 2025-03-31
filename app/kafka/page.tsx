import { checkApiToken, checkToken } from '@/lib/auth/token'
import { Filtere } from '@/app/kafka/Filtere.tsx'
import { MessagesView } from '@/app/kafka/MessagesView.tsx'

import styles from './page.module.css'

type Props = {
    searchParams: Promise<SearchParams>
}

export default async function KafkaOverview({ searchParams }: Props) {
    await checkToken()
    await checkApiToken()

    return (
        <section className={styles.page}>
            <Filtere className={styles.filtere} />
            <MessagesView />
        </section>
    )
}
