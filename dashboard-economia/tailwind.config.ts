import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/hooks/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          page: 'var(--color-bg-page)',
          card: 'var(--color-bg-card)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
        },
        accent: {
          primary: 'var(--color-accent-primary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle: 'var(--color-border-subtle)',
        },
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        chart: {
          selic: 'var(--chart-selic)',
          ipca: 'var(--chart-ipca)',
          dolar: 'var(--chart-dolar)',
          cdi: 'var(--chart-cdi)',
          desemprego: 'var(--chart-desemprego)',
        },
      },
      boxShadow: {
        md: '0 20px 40px rgba(15, 23, 42, 0.10)',
        xl: '0 24px 80px rgba(15, 23, 42, 0.16)',
      },
      borderRadius: {
        lg: '1.25rem',
        xl: '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
