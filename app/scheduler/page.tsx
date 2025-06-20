import { checkToken } from '@/lib/auth/token'
import { Tasks } from '@/app/scheduler/Tasks.tsx'

import styles from './page.module.css'

type Props = {
    searchParams: Promise<SearchParams>
}

export default async function TaskOverview({ searchParams }: Props) {
    await checkToken()

    const params = await searchParams

    return (
        <section className={styles.page}>
            <Tasks searchParams={params} />
        </section>
    )
}
