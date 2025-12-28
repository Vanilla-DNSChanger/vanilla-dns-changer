/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vanilla DNS Kick-style theme
        vanilla: {
          green: {
            DEFAULT: '#53FC18',
            hover: '#45d615',
            dark: '#3cc212',
            light: '#6ffd42',
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#53FC18',
            500: '#45d615',
            600: '#3cc212',
            700: '#2e9e0e',
            800: '#257a0b',
            900: '#1c5708',
          },
          dark: {
            DEFAULT: '#0a0a0a',
            50: '#1a1a1a',
            100: '#141414',
            200: '#1f1f1f',
            300: '#2a2a2a',
            400: '#333333',
            500: '#444444',
            600: '#555555',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
      animation: {
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px #53FC18, 0 0 10px #53FC18' },
          '100%': { boxShadow: '0 0 20px #53FC18, 0 0 30px #53FC18' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        vanilla: {
          'primary': '#53FC18',
          'primary-focus': '#45d615',
          'primary-content': '#000000',
          'secondary': '#1a1a1a',
          'secondary-focus': '#141414',
          'secondary-content': '#ffffff',
          'accent': '#53FC18',
          'accent-focus': '#45d615',
          'accent-content': '#000000',
          'neutral': '#1a1a1a',
          'neutral-focus': '#141414',
          'neutral-content': '#ffffff',
          'base-100': '#0a0a0a',
          'base-200': '#141414',
          'base-300': '#1a1a1a',
          'base-content': '#ffffff',
          'info': '#3b82f6',
          'success': '#53FC18',
          'warning': '#f59e0b',
          'error': '#ef4444',
          '--rounded-box': '0.75rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',
          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',
          '--btn-text-case': 'normal-case',
          '--btn-focus-scale': '0.95',
          '--border-btn': '1px',
          '--tab-border': '1px',
          '--tab-radius': '0.5rem',
        },
      },
    ],
    darkTheme: 'vanilla',
  },
};
