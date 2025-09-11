import { MessagesTableSkeleton } from '@/app/kafka/table/MessagesTable.tsx'
import { MessagesChartSkeleton } from '@/app/kafka/chart/MessagesChart.tsx'
import { Filtere } from './Filtere'

import styles from '@/app/kafka/page.module.css'

export default function Loading() {
    return (
        <section className={styles.page}>
            <Filtere className={styles.filtere} />
            <MessagesChartSkeleton />
            <MessagesTableSkeleton />
        </section>
    )
}
