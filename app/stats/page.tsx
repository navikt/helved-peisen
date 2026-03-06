import { checkToken } from '@/lib/server/auth.ts'

export default async function StatsView() {
    await checkToken()

    return (
        <section className="flex-1 h-full max-h-full relative flex flex-col p-4">
            <iframe
                src="https://metabase.ansatt.nav.no/public/dashboard/be77dd93-0740-45e1-870e-c9b602505408#theme=night&bordered=false&titled=false"
                width="100%"
                height="800"
                style={{ border: "none" }}
            />
        </section>
    )
}