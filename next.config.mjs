/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
        authInterrupts: true,
    },
    images: {
        unoptimized: true,
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
