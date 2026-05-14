/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        navy: {
          50:  '#EFF4FF',
          100: '#DBE8FE',
          500: '#3B6FD4',
          700: '#1D4ED8',
          800: '#1E3A8A',
          900: '#1a2f6e',
        },
      },
      boxShadow: {
        'card': '0 4px 32px 0 rgba(30, 58, 138, 0.10), 0 1.5px 6px 0 rgba(30,58,138,0.07)',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadein: 'fadein 0.55s cubic-bezier(.22,1,.36,1) both',
      },
    },
  },
  plugins: [],
}
