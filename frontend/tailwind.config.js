/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#4285F4',
          green: '#34A853',
          yellow: '#FBBC05',
          red: '#EA4335',
          background: '#F8F9FA',
          text: '#202124'
        },
        leaf: {
          50: '#E6F4EA',
          100: '#CEEAD6',
          500: '#34A853',
          700: '#188038'
        },
        ocean: {
          50: '#E8F0FE',
          500: '#4285F4',
          700: '#1967D2'
        },
        ink: '#202124'
      }
    }
  },
  plugins: []
};
