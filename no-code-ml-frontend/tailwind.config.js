/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#ea580c', // Orange similaire à DataFlow
          600: '#c2410c',
        }
      }
    },
  },
  plugins: [],
}