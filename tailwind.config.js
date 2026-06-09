/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        paper: {
          50: '#faf7f0',
          100: '#f5f1e8',
          200: '#e8e0d0',
          300: '#d4c8b0',
        },
        ink: {
          800: '#3d2c1e',
          700: '#5a4431',
          600: '#7a5c45',
        },
        sage: {
          50: '#e8efe8',
          100: '#d4e0d4',
          500: '#6b8e7a',
          600: '#4a6b5a',
          700: '#3a5446',
        },
        terracotta: {
          300: '#d4957a',
          500: '#b86f50',
          600: '#9a5a3f',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'book': '4px 4px 12px rgba(61, 44, 30, 0.15), -1px 1px 3px rgba(61, 44, 30, 0.1)',
        'card': '0 2px 8px rgba(61, 44, 30, 0.08), 0 8px 24px rgba(61, 44, 30, 0.06)',
        'float': '0 8px 32px rgba(61, 44, 30, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'progress': 'progress 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        progress: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
};
