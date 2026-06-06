import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './emails/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C4531C',
          dark: '#A33B00',
          darker: '#8A3A10',
          light: '#E07B4A',
        },
        surface: {
          sand: '#F5EFE3',
          DEFAULT: '#F9F3E7',
          warm: '#EDE3D0',
        },
        charcoal: {
          DEFAULT: '#3D3020',
          deep: '#1D1C14',
        },
        success: {
          DEFAULT: '#1A5C30',
          bg: '#F0FBF4',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '18px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
