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
          DEFAULT: '#640000', // Academic Maroon
          contrast: '#FFFFFF',
        },
        secondary: '#333333', // Charcoal
        tertiary: '#313131', // Darker charcoal for solid buttons
        neutral: {
          DEFAULT: '#E5E7EB', // Subtle borders
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
        },
        surface: '#FFFFFF',
        'on-surface': '#333333',
        background: '#FFFFFF',
        error: '#B00020',
        muted: '#F5F1EA', // Warm off-white
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        sans: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};
