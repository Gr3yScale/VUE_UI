import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        compass: {
          bg: '#0C1821',
          surface: '#1A2633',
          elevated: '#243041',
          border: '#2E3E50',
          muted: '#4A6070',
          text: '#C1D4E0',
          heading: '#E8F1F5',
          accent: '#00ED64',
          accentHover: '#00C050',
          error: '#EF4444',
          warn: '#F59E0B',
          string: '#86EFAC',
          number: '#93C5FD',
          boolean: '#C084FC',
          nullColor: '#6B7280',
          key: '#FCD34D',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
