import { checkApiToken, checkToken } from '@/lib/auth/token'
import { Filtere } from '@/app/kafka/Filtere.tsx'

import styles from './page.module.css'

export default async function KafkaOverview() {
    await checkToken()
    await checkApiToken()

    return (
        <section className={styles.page}>
            <Filtere />
        </section>
    )
}
