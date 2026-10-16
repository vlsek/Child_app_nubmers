import type { ActivityDef } from '@/types/activity'

/** Цифра 7 (агент 1): пожарные и следы. */
const activities: ActivityDef[] = [
  { id: 'tracks', title: 'Крокодил идёт по семи следам', component: () => import('./FootprintsActivity.vue') },
  { id: 'fire', title: 'Крокодил-пожарный тушит семь огоньков', component: () => import('./FireActivity.vue') },
  { id: 'give', title: 'Дай семь печенек', component: () => import('./GiveSeven.vue') },
]

export default activities
