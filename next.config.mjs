/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@navikt/ds-react', '@navikt/aksel-icons'],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/scheduler',
                permanent: false,
            },
        ]
    },
}

export default nextConfig
