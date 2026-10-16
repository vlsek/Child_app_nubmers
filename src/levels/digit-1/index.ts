import type { ActivityDef } from '@/types/activity'

/** Цифра 1 (агент 1): слонёнок и подарок. */
const activities: ActivityDef[] = [
  { id: 'gift', title: 'Один подарок', component: () => import('./GiftActivity.vue') },
  { id: 'trunk', title: 'Крокодил тянет слонёнка за хобот', component: () => import('./TrunkActivity.vue') },
  { id: 'give', title: 'Дай один арбуз', component: () => import('./GiveOne.vue') },
]

export default activities
