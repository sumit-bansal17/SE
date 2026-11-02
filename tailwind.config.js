/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          hover: '#4338CA',
          light: 'var(--c-brand-light)',
          soft: 'var(--c-brand-soft)',
        },
        surface: {
          DEFAULT: 'var(--c-surface)',
          card: 'var(--c-surface-card)',
          muted: 'var(--c-surface-muted)',
          light: 'var(--c-surface-light)',
        },
        ink: {
          DEFAULT: 'var(--c-ink)',
          secondary: 'var(--c-ink-secondary)',
          subtle: 'var(--c-ink-subtle)',
          muted: 'var(--c-ink-muted)',
          light: 'var(--c-ink-light)',
          border: 'var(--c-ink-border)',
          divider: 'var(--c-ink-divider)',
          accent: 'var(--c-ink-accent)',
        },
        success: {
          DEFAULT: '#16a34a',
          mid: '#059669',
          soft: '#d1fae5',
        },
        danger: {
          DEFAULT: '#dc2626',
          alt: '#ef4444',
          soft: '#fee2e2',
        },
        warning: {
          DEFAULT: '#d97706',
          soft: '#ffedd5',
        }
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
