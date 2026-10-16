import type { ActivityDef } from '@/types/activity'

/** Цифра 4 (агент 1): задания идут по очереди, от простого к сложному. */
const activities: ActivityDef[] = [
  { id: 'wheels', title: 'Поставь четыре колеса', component: () => import('./WheelsActivity.vue') },
  { id: 'donuts', title: 'Накорми крокодила четырьмя пончиками', component: () => import('./DonutsActivity.vue') },
  { id: 'seeds', title: 'Убери четыре косточки из арбуза', component: () => import('./SeedsActivity.vue') },
  { id: 'sheep', title: 'Крокодил засыпает и считает барашков', component: () => import('./SheepActivity.vue') },
  { id: 'give', title: 'Дай четыре яблока', component: () => import('./GiveFour.vue') },
]

export default activities
