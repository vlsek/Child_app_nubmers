import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { MAX_LEVEL, MIN_LEVEL } from '@/data/numbersLevels'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/numbers',
      name: 'numbers',
      // Игровые экраны грузим лениво — главное меню открывается мгновенно.
      component: () => import('@/views/NumbersGameView.vue'),
    },
    {
      path: '/numbers/:level(\\d+)',
      name: 'numbers-level',
      component: () => import('@/views/NumbersLevelView.vue'),
      // Уровней всего MIN_LEVEL..MAX_LEVEL; всё остальное возвращает в меню-пробку.
      beforeEnter: (to) => {
        const value = Number(to.params.level)
        return value >= MIN_LEVEL && value <= MAX_LEVEL ? true : { name: 'numbers' }
      },
    },
    {
      path: '/letters',
      name: 'letters',
      component: () => import('@/views/LettersGameView.vue'),
    },
    {
      // Любой неизвестный адрес ведёт в главное меню.
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' },
    },
  ],
})

export default router
