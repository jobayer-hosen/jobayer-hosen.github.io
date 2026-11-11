// Shared Tailwind theme. Loaded right after the Tailwind CDN script on every page.
tailwind.config = {
    theme: {
        extend: {
            colors: {
                navy: { DEFAULT: '#070c17', light: '#0e1626', lighter: '#1c2942' },
                slate: { DEFAULT: '#93a1bd', light: '#b9c4dc', lighter: '#d5def0' },
                ink: '#eaf1ff',
                accent: { DEFAULT: '#64ffda', dark: '#45d6b5' },
            },
            fontFamily: {
                sans: ['Inter', '"Hind Siliguri"', 'system-ui', 'sans-serif'],
                display: ['"Space Grotesk"', '"Hind Siliguri"', 'Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            maxWidth: { content: '1120px' },
        },
    },
};
