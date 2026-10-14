import { createRouter, createWebHistory } from 'vue-router'
import NumbersGameView from '@/views/NumbersGameView.vue'
import { MAX_LEVEL, MIN_LEVEL } from '@/data/numbersLevels'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      // Главный экран: пробка из машин, выбор уровня.
      path: '/',
      name: 'numbers',
      component: NumbersGameView,
    },
    {
      path: '/numbers/:level(\\d+)',
      name: 'numbers-level',
      // Экран уровня грузим лениво: пробка открывается мгновенно.
      component: () => import('@/views/NumbersLevelView.vue'),
      // Уровней всего MIN_LEVEL..MAX_LEVEL; всё остальное возвращает в пробку.
      beforeEnter: (to) => {
        const value = Number(to.params.level)
        return value >= MIN_LEVEL && value <= MAX_LEVEL ? true : { name: 'numbers' }
      },
    },
    {
      // Любой неизвестный адрес ведёт на главный экран.
      path: '/:pathMatch(.*)*',
      redirect: { name: 'numbers' },
    },
  ],
})

export default router
