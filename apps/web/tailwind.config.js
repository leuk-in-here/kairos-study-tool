/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--bg-primary)',
                secondary: 'var(--bg-secondary)',
                tertiary: 'var(--bg-tertiary)',
                primary: 'var(--text-primary)',
                'primary-muted': 'var(--text-secondary)',
                accent: 'var(--accent-primary)',
                border: 'var(--border-color)',
            }
        },
    },
    plugins: [],
}
