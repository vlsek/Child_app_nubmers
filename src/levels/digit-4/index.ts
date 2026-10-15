import type { ActivityDef } from '@/types/activity'
import WheelsPreview from './WheelsPreview.vue'

/** Цифра 4 (агент 1): активности, которых нет у других цифр. */
const activities: ActivityDef[] = [
  {
    id: 'wheels',
    title: 'Поставь четыре колеса',
    preview: WheelsPreview,
    component: () => import('./WheelsActivity.vue'),
  },
]

export default activities
