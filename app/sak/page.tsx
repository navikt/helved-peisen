import { checkToken } from '@/lib/auth/accessToken'
import { ensureValidApiToken } from '@/lib/auth/apiToken.ts'

import { Filtere } from './Filtere'
import { SakProvider } from './SakProvider'
import { SakView } from './SakView'

import styles from './page.module.css'

export default async function SakerView() {
    await checkToken()
    await ensureValidApiToken()

    return (
        <section className={styles.page}>
            <SakProvider>
                <Filtere />
                <SakView />
            </SakProvider>
        </section>
    )
}
