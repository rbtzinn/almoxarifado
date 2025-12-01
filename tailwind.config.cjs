/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <--- Importante: Adicione essa linha
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}