import { Filtere } from '@/app/kafka/Filtere.tsx'
import { MessagesView } from '@/app/kafka/MessagesView.tsx'
import { checkToken } from '@/lib/auth/accessToken'
import { ensureValidApiToken } from '@/lib/auth/apiToken.ts'

import styles from './page.module.css'

export default async function KafkaOverview() {
    await checkToken()
    await ensureValidApiToken()

    return (
        <section className={styles.page}>
            <Filtere className={styles.filtere} />
            <MessagesView />
        </section>
    )
}
