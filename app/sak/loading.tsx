import { SakerTableSkeleton } from './SakerTable'

import styles from './page.module.css'

export default function Loading() {
    return (
        <section className={styles.page}>
            <SakerTableSkeleton />
        </section>
    )
}
