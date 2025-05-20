/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: '#1DA1F2',
          blueHover: '#1a8cd8',
          darkBlue: '#0d8ddb',
          lightBlue: '#E8F5FD',
          gray: {
            50: '#F7F9FA',
            100: '#EFF3F4',
            200: '#E7E9EA',
            300: '#CFD9DE',
            400: '#B7C1C7',
            500: '#536471',
            600: '#4D5560',
            700: '#2F3336',
            800: '#1E2124',
            900: '#0F1419',
          },
          black: '#000000',
          white: '#FFFFFF',
          red: '#F4212E',
          green: '#00BA7C',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      borderRadius: {
        'twitter': '9999px',
      },
      boxShadow: {
        'twitter': '0 0 10px rgba(0, 0, 0, 0.1)',
        'twitter-hover': '0 0 15px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      transitionTimingFunction: {
        'twitter': 'cubic-bezier(0.08, 0.52, 0.52, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 