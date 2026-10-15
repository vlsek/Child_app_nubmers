import { createRouter, createWebHistory } from 'vue-router'
import ModesView from '@/views/ModesView.vue'
import { FIND_LEVELS } from '@/data/findLevels'
import { findActivity } from '@/levels/registry'
import { MAX_LEVEL, MIN_LEVEL } from '@/data/numbersLevels'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Главный экран: выбор режима.
    { path: '/', name: 'modes', component: ModesView },
    {
      // Внутри режима — карусель уровней (машинок).
      path: '/:mode(learn|find)',
      name: 'levels',
      component: () => import('@/views/LevelSelectView.vue'),
    },
    {
      path: '/learn/:level(\\d+)',
      name: 'learn-level',
      // Хаб цифры: плитки с активностями.
      component: () => import('@/views/LevelHubView.vue'),
      beforeEnter: (to) => {
        const value = Number(to.params.level)
        return value >= MIN_LEVEL && value <= MAX_LEVEL ? true : { name: 'levels', params: { mode: 'learn' } }
      },
    },
    {
      path: '/learn/:level(\\d+)/:activity',
      name: 'learn-activity',
      component: () => import('@/views/ActivityView.vue'),
      beforeEnter: (to) =>
        findActivity(Number(to.params.level), String(to.params.activity))
          ? true
          : { name: 'learn-level', params: { level: Number(to.params.level) || 1 } },
    },
    {
      path: '/find/:level(\\d+)',
      name: 'find-level',
      component: () => import('@/views/FindDigitView.vue'),
      beforeEnter: (to) => {
        const value = Number(to.params.level)
        return value >= 1 && value <= FIND_LEVELS.length ? true : { name: 'levels', params: { mode: 'find' } }
      },
    },
    {
      // Отдельные мини-игры агента 8; существующий экран счёта зверей остаётся без изменений.
      path: '/adventure/8',
      name: 'level-8-activities',
      component: () => import('@/views/Level8ActivitiesView.vue'),
    },
    // Галерея рисунков для разработки: в готовую сборку не попадает.
    ...(import.meta.env.DEV
      ? [{ path: '/art', name: 'art', component: () => import('@/views/ArtView.vue') }]
      : []),
    { path: '/:pathMatch(.*)*', redirect: { name: 'modes' } },
  ],
})

export default router
