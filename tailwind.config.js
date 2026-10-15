/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        kids: ['Nunito', '"Comic Sans MS"', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sunny: '#fde047',
        candy: '#f472b6',
        sky: {
          kid: '#38bdf8',
        },
        grass: '#4ade80',
        grape: '#a78bfa',
        tangerine: '#fb923c',
      },
      borderRadius: {
        blob: '2.5rem',
      },
      boxShadow: {
        // «Объёмные» кнопки: нижняя тень создаёт эффект нажатия
        'kid-yellow': '0 10px 0 0 #ca8a04',
        'kid-pink': '0 10px 0 0 #be185d',
        'kid-green': '0 10px 0 0 #15803d',
        'kid-purple': '0 10px 0 0 #6d28d9',
        'kid-pressed': '0 2px 0 0 rgba(0, 0, 0, 0.25)',
      },
      keyframes: {
        // Рука-подсказка «листай»: ведёт палец справа налево
        swipe: {
          '0%': { transform: 'translateX(60px)', opacity: '0' },
          '20%': { opacity: '1' },
          '70%': { transform: 'translateX(-60px)', opacity: '1' },
          '100%': { transform: 'translateX(-60px)', opacity: '0' },
        },
        // Зверь «подпрыгивает», когда его посчитали
        hop: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '40%': { transform: 'translateY(-22%) scale(1.15)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        swipe: 'swipe 1.8s ease-in-out infinite',
        hop: 'hop 0.45s ease-out',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        floaty: 'floaty 3s ease-in-out infinite',
        pop: 'pop 0.45s ease-out both',
      },
    },
  },
  plugins: [],
}
