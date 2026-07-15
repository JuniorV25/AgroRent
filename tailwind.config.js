/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        earth:  { 50:'#faf7f2',100:'#f2ebdd',200:'#e5d5b8',300:'#d3ba8a',400:'#c19a5b' },
        agua:   { 50:'#effcf9',100:'#c8f5ec',200:'#93e9db',300:'#5bd6c5',400:'#2bbfae',500:'#0d9488',600:'#0b7c72' },
        terra:  { 500:'#c2410c',600:'#9a3412' },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(13,148,136,0.15), 0 10px 40px -12px rgba(13,148,136,0.45)',
        float: '0 24px 60px -20px rgba(15,23,42,0.25)',
      },
      keyframes: {
        'fade-in-up': { '0%': { opacity:'0', transform:'translateY(18px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        'mesh': { '0%,100%': { transform:'translate(0,0) scale(1)' }, '50%': { transform:'translate(3%,4%) scale(1.08)' } },
        'float-y': { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-10px)' } },
      },
      animation: {
        'fade-in-up': 'fade-in-up .6s cubic-bezier(.16,1,.3,1) both',
        'mesh': 'mesh 14s ease-in-out infinite',
        'float-y': 'float-y 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
