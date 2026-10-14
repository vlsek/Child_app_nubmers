import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

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
