import { Link } from '@navikt/ds-react'

type Props = {
    traceId: string
}

const buildGrafanaTraceUrl = (traceId: string): string => {
    const baseUrl = 'https://grafana.nav.cloud.nais.io/explore'
    const params = new URLSearchParams({
        schemaVersion: '1',
        panes: JSON.stringify({
            trace: {
                datasource:
                    window.location.host.includes('dev') ||
                    window.location.host.includes('localhost')
                        ? 'P95CC91DC09CABFC8'
                        : 'P8A28344D07741F8D',
                queries: [
                    {
                        queryType: 'traceql',
                        query: traceId,
                    },
                ],
            },
        }),
    })
    return `${baseUrl}?${params.toString()}`
}

export const GrafanaTraceLink: React.FC<Props> = ({ traceId }) => {
    if (!traceId) {
        return null
    }

    return (
        <Link
            href={buildGrafanaTraceUrl(traceId)}
            target="_blank"
            style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
            }}
        >
            Vis trace i Grafana
        </Link>
    )
}
