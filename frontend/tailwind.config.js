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
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
        },
        accent: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
      },
    },
  },
  plugins: [],
}
