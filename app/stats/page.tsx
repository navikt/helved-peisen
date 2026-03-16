import { checkToken } from '@/lib/server/auth.ts'
import { Alert, BodyShort, Link } from '@navikt/ds-react'
import { EmbeddedMetabase } from './EmbeddedMetabase'

export default async function StatsView() {
    await checkToken()

    return (
        <section className="relative w-full h-screen">
            <div className=" p-4">
                <Alert variant="info" size="small" className="mb-4">
                    <BodyShort size="small">
                        Hvis dashboardet ikke laster,{' '}
                        <Link href="https://data.ansatt.nav.no/" target="_blank" rel="noopener noreferrer">
                            logg inn her
                        </Link>{' '}
                        og last siden på nytt.
                    </BodyShort>
                </Alert>
            </div>
            <EmbeddedMetabase />
        </section>
    )
}
