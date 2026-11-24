import type { ActivityDef } from '@/types/activity'

/** Цифра 5 (агент 1): цветы и поезд. */
const activities: ActivityDef[] = [
  { id: 'flowers', title: 'Крокодил поливает пять цветочков', component: () => import('./FlowersActivity.vue') },
  { id: 'train', title: 'Крокодил-машинист цепляет пять вагончиков', component: () => import('./TrainActivity.vue') },
  { id: 'feed', title: 'Покорми крокодила пятью яблоками', component: () => import('./FeedActivity.vue') },
  { id: 'fingers', title: 'Привяжи пять шариков на пять пальчиков', component: () => import('./FingersActivity.vue') },
]

export default activities
