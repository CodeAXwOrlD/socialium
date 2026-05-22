import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Material Design 3 - Socialium Palette
        surface: {
          DEFAULT: '#141218',
          dim: '#141218',
          bright: '#3b383e',
          'container-lowest': '#0f0d13',
          'container-low': '#1d1b20',
          container: '#211f24',
          'container-high': '#2b292f',
          'container-highest': '#36343a',
        },
        primary: {
          DEFAULT: '#cfbcff',
          'fixed': '#e9ddff',
          'fixed-dim': '#cfbcff',
          container: '#6750a4',
        },
        secondary: {
          DEFAULT: '#cdc0e9',
          'fixed': '#e9ddff',
          'fixed-dim': '#cdc0e9',
          container: '#4d4465',
        },
        tertiary: {
          DEFAULT: '#e7c365',
          'fixed': '#ffdf93',
          'fixed-dim': '#e7c365',
          container: '#c9a74d',
        },
        'on-surface': '#e6e0e9',
        'on-surface-variant': '#cbc4d2',
        'on-primary': '#381e72',
        'on-secondary': '#342b4b',
        'on-tertiary': '#3e2e00',
        outline: {
          DEFAULT: '#948e9c',
          variant: '#494551',
        },
        background: '#141218',
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['36px', { lineHeight: '44px', fontWeight: '700' }],
        'display-md': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'title-lg': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'title-md': ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
