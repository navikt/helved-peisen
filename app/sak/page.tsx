import { checkToken } from '@/lib/auth/accessToken'
import { ensureValidApiToken } from '@/lib/auth/apiToken.ts'
import { SakerTable } from './SakerTable'
import { Filtere } from './Filtere'

import styles from './page.module.css'

export default async function SakerView() {
    await checkToken()
    await ensureValidApiToken()

    return (
        <section className={styles.page}>
            <Filtere />
            <SakerTable />
        </section>
    )
}
