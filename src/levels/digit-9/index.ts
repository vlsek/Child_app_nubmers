import type { ActivityDef } from '@/types/activity'

/** Цифра 9 (агент 1): рыбалка и башня. */
const activities: ActivityDef[] = [
  { id: 'fishing', title: 'Крокодил ловит девять рыбок', component: () => import('./FishingActivity.vue') },
  { id: 'tower', title: 'Построй башню из девяти кубиков', component: () => import('./TowerActivity.vue') },
  { id: 'give', title: 'Дай девять звёздочек', component: () => import('./GiveNine.vue') },
]

export default activities
