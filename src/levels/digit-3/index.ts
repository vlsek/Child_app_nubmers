import type { ActivityDef } from '@/types/activity'

/** Цифра 3 (агент 1): шарики, свечки, лестница. */
const activities: ActivityDef[] = [
  { id: 'balloons', title: 'Крокодил лопает три шарика', component: () => import('./BalloonsActivity.vue') },
  { id: 'stairs', title: 'Крокодил поднимается по трём ступенькам', component: () => import('./StairsActivity.vue') },
  { id: 'candles', title: 'Крокодил задувает три свечки', component: () => import('./CandlesActivity.vue') },
  { id: 'give', title: 'Дай три печеньки', component: () => import('./GiveThree.vue') },
]

export default activities
