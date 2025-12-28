/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vanilla: {
          green: {
            DEFAULT: '#53FC18',
            hover: '#45d615',
            dark: '#3cc212',
            light: '#6ffd42',
          },
          dark: {
            DEFAULT: '#0a0a0a',
            50: '#1a1a1a',
            100: '#141414',
            200: '#1f1f1f',
            300: '#2a2a2a',
            400: '#333333',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px #53FC18, 0 0 10px #53FC18' },
          '100%': { boxShadow: '0 0 20px #53FC18, 0 0 30px #53FC18' },
        },
      },
    },
  },
  plugins: [],
};
