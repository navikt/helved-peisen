import { checkToken } from '@/lib/server/auth.ts'
import { Alert, BodyShort, Link } from '@navikt/ds-react'

export default async function StatsView() {
    await checkToken()

    return (
        <section className="relative w-full h-screen p-4">
            <Alert variant="info" size="small" className="mb-4">
                <BodyShort size="small">
                    Hvis dashboardet ikke laster,{' '}
                    <Link href="https://data.ansatt.nav.no/" target="_blank" rel="noopener noreferrer">
                        logg inn her
                    </Link>{' '}
                    og last siden på nytt.
                </BodyShort>
            </Alert>
            <iframe
                src="https://metabase.ansatt.nav.no/public/dashboard/be77dd93-0740-45e1-870e-c9b602505408#theme=night&bordered=false&titled=false"
                className="w-full h-full"
                style={{ border: 'none' }}
            />
        </section>
    )
}