import { Link } from '@navikt/ds-react'
import { LinkIcon } from '@navikt/aksel-icons'

type Props = {
    traceId: string | null | undefined
}

const buildGrafanaTraceUrl = (
    traceId: string,
    environment: 'dev' | 'prod' = 'prod'
): string => {
    const baseUrl = 'https://grafana.nav.cloud.nais.io/explore'

    const config =
        environment === 'dev'
            ? {
                  paneKey: 'sd4',
                  datasourceUid: 'P95CC91DC09CABFC8',
                  timeRange: { from: 'now-1h', to: 'now' },
              }
            : {
                  paneKey: 'vns',
                  datasourceUid: 'P8A28344D07741F8D',
                  timeRange: { from: 'now-24h', to: 'now' },
              }

    const params = new URLSearchParams({
        schemaVersion: '1',
        panes: JSON.stringify({
            [config.paneKey]: {
                datasource: config.datasourceUid,
                queries: [
                    {
                        refId: 'A',
                        datasource: {
                            type: 'tempo',
                            uid: config.datasourceUid,
                        },
                        queryType: 'traceql',
                        limit: 20,
                        tableType: 'traces',
                        metricsQueryType: 'range',
                        query: traceId,
                    },
                ],
                range: config.timeRange,
            },
        }),
        orgId: '1',
    })
    return `${baseUrl}?${params.toString()}`
}

export const GrafanaTraceLink: React.FC<Props> = ({ traceId }) => {
    if (!traceId) {
        return null
    }

    const environment = process.env.NODE_ENV === 'development' ? 'dev' : 'prod'

    return (
        <Link href={buildGrafanaTraceUrl(traceId, environment)} target="_blank">
            <LinkIcon title="View trace in Grafana" />
        </Link>
    )
}
