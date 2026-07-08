/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#FAF8F4',
          paper: '#FAF8F4',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F9F7F3',
        },
        text: {
          primary: '#000000',
          secondary: '#333333',
          tertiary: '#666666',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E8EFE8',
          200: '#D5E2D5',
          300: '#B8D0B8',
          400: '#9FC5A4',
          500: '#7BAE7F',
          600: '#5A8A5E',
          700: '#4A734D',
          800: '#3D5E40',
          900: '#354F38',
        },
        amber: {
          50: '#FDF8F0',
          100: '#FAF0E0',
          200: '#F4DFC0',
          300: '#EDC998',
          400: '#E5B46E',
          500: '#D4A853',
          600: '#B88F40',
          700: '#9A7537',
          800: '#7D5F30',
          900: '#664F2A',
        },
        rose: {
          50: '#FEF5F5',
          100: '#FEE7E7',
          200: '#FED2D2',
          300: '#FBB5B5',
          400: '#F88F8F',
          500: '#B87373',
          600: '#9A5E5E',
        },
        border: {
          DEFAULT: '#E8E4DF',
          light: '#F0EEEA',
        },
        success: '#6B9B6F',
        warning: '#C49859',
        error: '#B87373',
      },
      boxShadow: {
        card: '0 2px 12px rgba(45, 42, 38, 0.06)',
        cardHover: '0 8px 24px rgba(45, 42, 38, 0.1)',
        input: '0 1px 3px rgba(45, 42, 38, 0.06)',
        inputFocus: '0 0 0 3px rgba(123, 174, 127, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      borderRadius: {
        'sm': '8px',
        DEFAULT: '12px',
        'lg': '16px',
        'xl': '20px',
      },
    },
  },
  plugins: [],
};
