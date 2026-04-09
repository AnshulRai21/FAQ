/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        orb: {
          purple: '#7B61FF',
          pink: '#FF6FD8',
          blue: '#4FACFE',
        },
        hostel: {
          50: '#f8f4ff',
          100: '#ede5ff',
          200: '#d9caff',
          300: '#bea6ff',
          400: '#9f78ff',
          500: '#7B61FF',
          600: '#6344f5',
          700: '#5231e1',
          800: '#4429bc',
          900: '#3a2499',
        },
      },
      animation: {
        'orb-float': 'orbFloat 6s ease-in-out infinite',
        'orb-breathe': 'orbBreathe 3s ease-in-out infinite',
        'orb-glow': 'orbGlow 4s ease-in-out infinite',
        'float-around': 'floatAround 12s ease-in-out infinite',
        'typing-dot': 'typingDot 1.2s ease-in-out infinite',
        'message-in': 'messageSlideIn 0.3s ease-out',
        'chip-in': 'chipFadeIn 0.25s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'gradient-shift': 'gradientShift 4s ease infinite',
      },
      keyframes: {
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px) scale(1)' },
          '25%': { transform: 'translateY(-18px) translateX(8px) scale(1.02)' },
          '50%': { transform: 'translateY(-8px) translateX(-10px) scale(0.98)' },
          '75%': { transform: 'translateY(-22px) translateX(5px) scale(1.03)' },
        },
        orbBreathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        orbGlow: {
          '0%, 100%': {
            boxShadow: '0 0 40px rgba(123,97,255,0.4), 0 0 80px rgba(255,111,216,0.2)',
          },
          '50%': {
            boxShadow: '0 0 70px rgba(123,97,255,0.65), 0 0 120px rgba(255,111,216,0.4)',
          },
        },
        floatAround: {
          '0%': { transform: 'translate(0, 0)' },
          '16%': { transform: 'translate(15px, -25px)' },
          '33%': { transform: 'translate(-10px, -15px)' },
          '50%': { transform: 'translate(20px, 10px)' },
          '66%': { transform: 'translate(-15px, 20px)' },
          '83%': { transform: 'translate(10px, -10px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
        messageSlideIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        chipFadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
};
