/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'hsl(220, 90%, 55%)',
        secondary: 'hsl(260, 70%, 60%)',
        accent: 'hsl(340, 80%, 60%)',
      },
      backdropBlur: { 'xs': '2px' },
    },
  },
  plugins: [],
};
