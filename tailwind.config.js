/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundColor: {
        dark: '#181818',
        'dark-soft': '#222222',
        'dark-mute': '#282828',
      },
      textColor: {
        'dark-text': 'rgba(235, 235, 235, 0.64)',
      }
    },
  },
  plugins: [],
} 