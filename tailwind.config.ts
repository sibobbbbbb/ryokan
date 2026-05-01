import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#111118',
        'bg-card': '#16161f',
        'bg-elevated': '#1c1c28',
        'accent-primary': '#7c6af7',
        'accent-warn': '#f0a429',
        'accent-danger': '#ef4444',
        'accent-safe': '#22c55e',
        'text-primary': '#e8e8f0',
        'text-secondary': '#9898b0',
        'text-muted': '#5a5a70',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        display: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
