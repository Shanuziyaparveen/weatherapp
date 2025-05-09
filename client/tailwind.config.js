/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'weather-blue': {
          100: '#E3F2FD',
          200: '#BBDEFB',
          300: '#90CAF9',
          400: '#64B5F6',
          500: '#42A5F5',
          600: '#2196F3',
          700: '#1E88E5',
          800: '#1976D2',
          900: '#1565C0',
        },
        'weather-orange': {
          100: '#FFF3E0',
          200: '#FFE0B2',
          300: '#FFCC80',
          400: '#FFB74D',
          500: '#FFA726',
          600: '#FF9800',
          700: '#FB8C00',
          800: '#F57C00',
          900: '#EF6C00',
        },
      },
      boxShadow: {
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      fontSize: {
        'temp': '5rem',
      },
    },
  },
  plugins: [],
}