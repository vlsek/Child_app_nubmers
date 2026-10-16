import type { ActivityDef } from '@/types/activity'

/** Цифра 9 (агент 1): рыбалка и башня. */
const activities: ActivityDef[] = [
  { id: 'fishing', title: 'Крокодил ловит девять рыбок', component: () => import('./FishingActivity.vue') },
  { id: 'tower', title: 'Построй башню из девяти кубиков', component: () => import('./TowerActivity.vue') },
]

export default activities
