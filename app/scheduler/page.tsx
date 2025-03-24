import { checkApiToken, checkToken } from '@/lib/auth/token'
import { Tasks } from '@/components/Tasks.tsx'
import { MinesweeperProgram } from '@/components/minesweeper'

import styles from './page.module.css'

type Props = {
    searchParams: Promise<SearchParams>
}

export default async function TaskOverview({ searchParams }: Props) {
    await checkToken()
    await checkApiToken()

    const params = await searchParams

    return (
        <section className={styles.page}>
            <Tasks searchParams={params} />
            {params['minesweeper'] && <MinesweeperProgram />}
        </section>
    )
}
