const kafkaApiBaseUrl = process.env.API_BASE_URL

export const Routes = {
    internal: {
        manuellKvittering: `/api/manuell-kvittering`,
    },
    external: {
        kafka: `${kafkaApiBaseUrl}/api`,
        manuellKvittering: `${kafkaApiBaseUrl}/manuell-kvittering`,
    },
} as const
