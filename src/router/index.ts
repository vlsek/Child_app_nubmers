import { createRouter, createWebHistory } from 'vue-router'
import ModesView from '@/views/ModesView.vue'
import { FIND_LEVELS } from '@/data/findLevels'
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
      // Уровень цифры: задания идут по очереди.
      component: () => import('@/views/SequenceView.vue'),
      beforeEnter: (to) => {
        const value = Number(to.params.level)
        return value >= MIN_LEVEL && value <= MAX_LEVEL ? true : { name: 'levels', params: { mode: 'learn' } }
      },
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
    // Режим «Для старших» (агент 4): выбор цифры и задания «напиши / раскрась».
    { path: '/older/:level(\\d+)?', name: 'older', component: () => import('@/views/OlderView.vue') },
    // Режим «Сколько?» (агент 4): N зверей и три цифры на выбор.
    { path: '/howmany', name: 'howmany', component: () => import('@/views/HowManyView.vue') },
    // Галерея рисунков для разработки: в готовую сборку не попадает.
    ...(import.meta.env.DEV
      ? [{ path: '/art', name: 'art', component: () => import('@/views/ArtView.vue') }]
      : []),
    { path: '/:pathMatch(.*)*', redirect: { name: 'modes' } },
  ],
})

export default router
