import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './emails/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        sans:     ['var(--font-sans)', 'sans-serif'],
        mono:     ['var(--font-mono)', 'monospace'],
        display:  ['var(--font-playfair)', 'serif'],
        body:     ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#C4531C',
          dark:    '#A33B00',
          darker:  '#8A3A10',
          light:   '#E07B4A',
        },
        surface: {
          sand:    '#F5EFE3',
          DEFAULT: '#F9F3E7',
          warm:    '#EDE3D0',
        },
        terra: {
          DEFAULT: '#C4531C',
          dark:    '#8A3A10',
          light:   '#E07B4A',
          50:      '#FDF0E8',
          100:     '#FAECE7',
        },
        sand: {
          DEFAULT: '#F5EFE3',
          warm:    '#EDE3D0',
          deep:    '#DDD0BA',
        },
        charcoal: {
          DEFAULT: '#3D3020',
          dark:    '#1D1C14',
        },
        success: {
          DEFAULT: '#1A5C30',
          bg:      '#F0FBF4',
          light:   '#E8F5EE',
        },
        muted:             '#7A6E58',
        outline:           '#8B7268',
        'outline-variant': '#DFC0B5',
      },
      borderRadius: {
        card:   '18px',
        button: '14px',
        input:  '12px',
        chip:   '20px',
        badge:  '8px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.07)',
        fab:  '0 6px 20px rgba(138,58,16,0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
