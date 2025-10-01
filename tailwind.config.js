import akselTw from '@navikt/ds-tailwind'

const config = {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    presets: [akselTw],
    theme: {
        extend: {
            boxShadow: {
                'tab-shadow': 'inset 0 -2px 0 var(--ax-border-accent-strong)',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(-10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out forwards',
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.scrollbar-gutter-stable': {
                    'scrollbar-gutter': 'stable',
                },
            })
        },
    ],
}

export default config
