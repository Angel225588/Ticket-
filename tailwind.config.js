/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        parissy: {
          navy: '#1e3a5f',
          gold: '#c9a84c',
        },
      },
      animation: {
        'pulse-alert': 'pulse-alert 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-alert': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)' },
          '50%': { boxShadow: '0 0 0 8px rgba(239, 68, 68, 0)' },
        },
      },
    },
  },
  plugins: [],
};
