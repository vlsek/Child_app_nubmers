import type { ActivityDef } from '@/types/activity'

/** Цифра 10 (агент 1): яйца и автобус. */
const activities: ActivityDef[] = [
  { id: 'eggs', title: 'Помоги десяти цыплятам вылупиться', component: () => import('./EggsActivity.vue') },
  { id: 'bus', title: 'Посади десять цыплят в автобус', component: () => import('./BusActivity.vue') },
  { id: 'give', title: 'Дай десять арбузов', component: () => import('./GiveTen.vue') },
]

export default activities
