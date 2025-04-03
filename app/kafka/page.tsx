import { checkApiToken, checkToken } from '@/lib/auth/peisschtappernToken'
import { Filtere } from '@/app/kafka/Filtere.tsx'
import { MessagesView } from '@/app/kafka/MessagesView.tsx'

import styles from './page.module.css'

export default async function KafkaOverview() {
    await checkToken()
    await checkApiToken()

    return (
        <section className={styles.page}>
            <Filtere className={styles.filtere} />
            <MessagesView />
        </section>
    )
}
