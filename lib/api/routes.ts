const kafkaApiBaseUrl = process.env.API_BASE_URL
const utsjekkBaseUrl = process.env.UTSJEKK_BASE_URL
const vedskivaBaseUrl = process.env.VEDSKIVA_BASE_URL

export const Routes = {
    messages: `${kafkaApiBaseUrl}/api/messages`,
    resend: `${kafkaApiBaseUrl}/api/resend`,
    manuellKvittering: `${kafkaApiBaseUrl}/manuell-kvittering`,
    pendingTilUtbetaling: `${kafkaApiBaseUrl}/pending-til-utbetaling`,
    tombstoneUtbetaling: `${kafkaApiBaseUrl}/tombstone-utbetaling`,
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
} as const
