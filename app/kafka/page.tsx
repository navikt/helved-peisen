import { checkApiToken, checkToken } from '@/lib/auth/token'
import styles from './page.module.css'
import { KafkaFiltere } from '@/app/kafka/Filtere.tsx'


export default async function KafkaOverview() {
    await checkToken()
    await checkApiToken()


    return (
        <section className={styles.page}>
           Kafka
            <KafkaFiltere/>

        </section>
    )
}
