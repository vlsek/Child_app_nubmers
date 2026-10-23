import type { ActivityDef } from '@/types/activity'

/** Цифра 2 (агент 1): птенцы и велосипед. */
const activities: ActivityDef[] = [
  { id: 'chicks', title: 'Крокодил кормит двух птенцов', component: () => import('./FeedChicksActivity.vue') },
  { id: 'bike', title: 'Убери с дороги два камня', component: () => import('./BikeActivity.vue') },
  { id: 'drums', title: 'Два барабана', component: () => import('./DrumsActivity.vue') },
]

export default activities
