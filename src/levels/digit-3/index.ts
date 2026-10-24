import type { ActivityDef } from '@/types/activity'

/** Цифра 3 (агент 1): шарики, свечки, лестница. */
const activities: ActivityDef[] = [
  { id: 'balloons', title: 'Крокодил лопает три шарика', component: () => import('./BalloonsActivity.vue') },
  { id: 'stairs', title: 'Крокодил поднимается по трём ступенькам', component: () => import('./StairsActivity.vue') },
  { id: 'candles', title: 'Расставь три свечки на торте', component: () => import('./CandlesActivity.vue') },
  { id: 'lily', title: 'Крокодил прыгает по трём кувшинкам', component: () => import('./LilyActivity.vue') },
]

export default activities
