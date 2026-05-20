const kafkaApiBaseUrl = process.env.API_BASE_URL
const utsjekkBaseUrl = process.env.UTSJEKK_BASE_URL
const vedskivaBaseUrl = process.env.VEDSKIVA_BASE_URL
const speiderhyttaBaseUrl = process.env.SPEIDERHYTTA_BASE_URL

export const Routes = {
    messages: `${kafkaApiBaseUrl}/api/messages`,
    resend: `${kafkaApiBaseUrl}/api/resend`,
    manuellKvittering: `${kafkaApiBaseUrl}/manuell-kvittering`,
    pendingTilUtbetaling: `${kafkaApiBaseUrl}/pending-til-utbetaling`,
    tombstoneUtbetaling: `${kafkaApiBaseUrl}/tombstone-utbetaling`,
    okStatus: `${kafkaApiBaseUrl}/ok-status`,
    saker: `${kafkaApiBaseUrl}/api/saker`,
    sak(sakId: string, fagsystem: string) {
        return `${kafkaApiBaseUrl}/api/saker/${sakId}/${fagsystem}`
    },
    remigrer: `${utsjekkBaseUrl}/api/iverksetting/v2/migrate`,
    remigrerDryrun: `${utsjekkBaseUrl}/api/iverksetting/v2/migrate/dryrun`,
    avstemmingDryrun: `${vedskivaBaseUrl}/api/avstem/dryrun`,
    avstemmingDryrunv2: `${vedskivaBaseUrl}/api/avstem2/dryrun`,
    avstemmingNextRange: `${vedskivaBaseUrl}/api/next_range`,
    avstemminger: `${kafkaApiBaseUrl}/api/avstemminger`,
    dora: `${speiderhyttaBaseUrl}/dora`,
    doraApp(app: string, window?: string) {
        const qs = window ? `?window=${encodeURIComponent(window)}` : ''
        return `${speiderhyttaBaseUrl}/dora/${encodeURIComponent(app)}${qs}`
    },
    doraDeployments(app: string, limit: number = 50) {
        return `${speiderhyttaBaseUrl}/dora/${encodeURIComponent(app)}/deployments?limit=${limit}`
    },
    doraIncidents(app: string, limit: number = 50) {
        return `${speiderhyttaBaseUrl}/dora/${encodeURIComponent(app)}/incidents?limit=${limit}`
    },
} as const
