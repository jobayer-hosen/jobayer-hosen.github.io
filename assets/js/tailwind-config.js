// Shared Tailwind theme. Loaded right after the Tailwind CDN script on every page.
tailwind.config = {
    theme: {
        extend: {
            colors: {
                navy: { DEFAULT: '#0a192f', light: '#112240', lighter: '#233554' },
                slate: { DEFAULT: '#8892b0', light: '#a8b2d1', lighter: '#ccd6f6' },
                ink: '#e6f1ff',
                accent: { DEFAULT: '#64ffda', dark: '#45d6b5' },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            maxWidth: { content: '1100px' },
        },
    },
};
