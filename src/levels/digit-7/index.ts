import type { ActivityDef } from '@/types/activity'

/** Цифра 7 (агент 1): пожарные и следы. */
const activities: ActivityDef[] = [
  { id: 'tracks', title: 'Крокодил идёт по семи следам', component: () => import('./FootprintsActivity.vue') },
  { id: 'rainbow', title: 'Нарисуй радугу из семи красок', component: () => import('./RainbowActivity.vue') },
  { id: 'fire', title: 'Крокодил-пожарный тушит семь огоньков', component: () => import('./FireActivity.vue') },
  { id: 'xylophone', title: 'Сыграй семь нот на ксилофоне', component: () => import('./XylophoneActivity.vue') },
]

export default activities
