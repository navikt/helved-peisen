/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
        authInterrupts: true,
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/kafka',
                permanent: false,
            },
        ]
    },
}

export default nextConfig
