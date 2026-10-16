import type { ActivityDef } from '@/types/activity'

/** Цифра 5 (агент 1): цветы и поезд. */
const activities: ActivityDef[] = [
  { id: 'flowers', title: 'Крокодил поливает пять цветочков', component: () => import('./FlowersActivity.vue') },
  { id: 'train', title: 'Крокодил-машинист цепляет пять вагончиков', component: () => import('./TrainActivity.vue') },
]

export default activities
