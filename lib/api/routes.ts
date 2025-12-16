const kafkaApiBaseUrl = process.env.API_BASE_URL

export const Routes = {
    external: {
        kafka: `${kafkaApiBaseUrl}/api`,
        manuellKvittering: `${kafkaApiBaseUrl}/manuell-kvittering`,
        manuellOppdrag: `${kafkaApiBaseUrl}/manuell-oppdrag`,
        pendingTilUtbetaling: `${kafkaApiBaseUrl}/pending-til-utbetaling`,
        tombstoneUtbetaling: `${kafkaApiBaseUrl}/tombstone-utbetaling`,
        resendDagpenger: `${kafkaApiBaseUrl}/resend-dagpenger`,
        saker: `${kafkaApiBaseUrl}/api/saker`,
        sak(sakId: string, fagsystem: string) {
            return `${kafkaApiBaseUrl}/api/saker/${sakId}/${fagsystem}`
        },
    },
} as const
