import type { ActivityDef } from '@/types/activity'

/** Цифра 6 (агент 1): яблоки и пузыри. */
const activities: ActivityDef[] = [
  { id: 'apples', title: 'Крокодил собирает шесть яблок', component: () => import('./ApplesActivity.vue') },
  { id: 'bubbles', title: 'Крокодил в ванне лопает шесть пузырей', component: () => import('./BubblesActivity.vue') },
  { id: 'hide', title: 'Найди шестерых зверьков в прятках', component: () => import('./HideSeekActivity.vue') },
]

export default activities
