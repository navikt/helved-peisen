import styles from '@/app/kafka/page.module.css'
import { Filtere } from '@/app/kafka/Filtere.tsx'
import { MessagesTableSkeleton } from '@/app/kafka/MessagesTable.tsx'

export default function Loading() {
    return (
        <section className={styles.page}>
            <Filtere className={styles.filtere} />
            <MessagesTableSkeleton />
        </section>
    )
}
