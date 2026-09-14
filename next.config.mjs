/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
        authInterrupts: true,
        testProxy: process.env.NEXT_TEST_PROXY === 'enabled',
    },
    images: {
        unoptimized: true,
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/dashboard',
                permanent: false,
            },
        ]
    },
    serverExternalPackages: ['@navikt/next-logger', 'pino', '@valkey/valkey-glide'],
}

export default nextConfig
