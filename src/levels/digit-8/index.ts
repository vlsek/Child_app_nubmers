import type { ActivityDef } from '@/types/activity'

/** Цифра 8 (агент 1, по просьбе пользователя): зубки и морковки. */
const activities: ActivityDef[] = [
  { id: 'teeth', title: 'Птичка чистит восемь зубов', component: () => import('./TeethActivity.vue') },
  { id: 'harvest', title: 'Трактор возит восемь морковок', component: () => import('./HarvestActivity.vue') },
]

export default activities
