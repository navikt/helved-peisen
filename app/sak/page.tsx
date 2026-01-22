import { Filtere } from './Filtere'
import { SakProvider } from './SakProvider'
import { SakView } from './SakView'
import { checkToken, ensureValidApiToken } from '@/lib/server/auth.ts'

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
