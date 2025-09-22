import { checkToken } from '@/lib/auth/accessToken'
import { ensureValidApiToken } from '@/lib/auth/apiToken.ts'

import { Filtere } from './Filtere'
import { SakProvider } from './SakProvider'
import { SakView } from './SakView'

export default async function SakerView() {
    await checkToken()
    await ensureValidApiToken()

    return (
        <section className="flex-1 h-full max-h-full relative flex flex-col p-4">
            <SakProvider>
                <Filtere />
                <SakView />
            </SakProvider>
        </section>
    )
}
