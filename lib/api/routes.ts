const kafkaApiBaseUrl = process.env.API_BASE_URL

export const Routes = {
    external: {
        kafka: `${kafkaApiBaseUrl}/api`,
        resend: `${kafkaApiBaseUrl}/api/resend`,
        manuellKvittering: `${kafkaApiBaseUrl}/manuell-kvittering`,
        pendingTilUtbetaling: `${kafkaApiBaseUrl}/pending-til-utbetaling`,
        tombstoneUtbetaling: `${kafkaApiBaseUrl}/tombstone-utbetaling`,
        saker: `${kafkaApiBaseUrl}/api/saker`,
        sak(sakId: string, fagsystem: string) {
            return `${kafkaApiBaseUrl}/api/saker/${sakId}/${fagsystem}`
        },
    },
    internal: {
        messages: `/api/messages`,
        message(topic: string, partition: number, offset: number) {
            return `${Routes.internal.messages}/${topic}/${partition}/${offset}`
        },
        resend(topic: string, partition: number, offset: number) {
            return `${Routes.internal.message(topic, partition, offset)}/resend`
        },
        sak(sakId: string, fagsystem: string) {
            return `/api/saker/${fagsystem}/${sakId}`
        },
    },
} as const
