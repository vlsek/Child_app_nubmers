import type { ActivityDef } from '@/types/activity'

/** Цифра 2 (агент 1): птенцы и велосипед. */
const activities: ActivityDef[] = [
  { id: 'chicks', title: 'Крокодил кормит двух птенцов', component: () => import('./FeedChicksActivity.vue') },
  { id: 'bike', title: 'Крокодил на велосипеде прыгает через два пенька', component: () => import('./BikeActivity.vue') },
  { id: 'give', title: 'Дай два мячика', component: () => import('./GiveTwo.vue') },
]

export default activities
