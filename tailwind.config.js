/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1B4B3F',
                    light: '#2C7A68',
                    dark: '#123530',
                    50: '#E6EFED',
                },
                secondary: {
                    DEFAULT: '#82D164',
                    light: '#9FE285',
                    dark: '#68B34E',
                    50: '#F0F9ED',
                },
                sage: {
                    DEFAULT: '#94A3B8',
                    light: '#E2E8F0',
                    dark: '#64748B',
                },
                gray: {
                    50: '#F9FAFB',
                    100: '#F3F4F6',
                    200: '#E5E7EB',
                    300: '#D1D5DB',
                    400: '#9CA3AF',
                    500: '#6B7280',
                    600: '#4B5563',
                    700: '#374151',
                    800: '#1F2937',
                    900: '#111827',
                },
                earth: {
                    DEFAULT: '#8B5E3C',
                    light: '#A67C5B',
                    dark: '#6F4B30',
                },
                cream: {
                    DEFAULT: '#FAF9F6',
                    dark: '#F5F4F1',
                },
                neutral: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#EFEFEF',
                    300: '#E5E5E5',
                    400: '#D4D4D4',
                    500: '#667085',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
                success: {
                    DEFAULT: '#82D164',
                    light: '#9FE285',
                    dark: '#68B34E',
                },
                warning: {
                    DEFAULT: '#FDB022',
                    light: '#FEC84B',
                    dark: '#F79009',
                },
                error: {
                    DEFAULT: '#F04438',
                    light: '#FDA29B',
                    dark: '#D92D20',
                }
            },
            fontFamily: {
                ivy: ['IvyMode', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            container: {
                center: true,
                padding: '1rem',
                screens: {
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1280px',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'leaf-pattern': "url('/patterns/leaf.svg')",
                'grid-pattern': `
                    linear-gradient(to right, rgba(229, 231, 235, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(229, 231, 235, 0.1) 1px, transparent 1px)
                `,
                'grid-pattern-dark': `
                    linear-gradient(to right, rgba(17, 24, 39, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(17, 24, 39, 0.05) 1px, transparent 1px)
                `,
            },
            backgroundSize: {
                'grid': '4rem 4rem',
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                farmwise: {
                    "primary": "#1B4B3F",
                    "secondary": "#82D164",
                    "accent": "#8B5E3C",
                    "neutral": "#667085",
                    "base-100": "#FAF9F6",
                    "base-200": "#F5F4F1",
                    "base-300": "#E5E5E5",
                    "base-content": "#262626",
                    "info": "#3ABFF8",
                    "success": "#82D164",
                    "warning": "#FDB022",
                    "error": "#F04438",
                },
            },
        ],
    },
} 